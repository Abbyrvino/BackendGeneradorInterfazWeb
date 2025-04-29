import dotenv from 'dotenv';
import app from './app.js';
import { sequelize } from './config/db.js';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver'; // Librería para crear archivos zip


// 1. Configuración inicial
dotenv.config();
const PORT = process.env.PORT || 4000;

console.log('\n========================================');
console.log('🔄 Iniciando servidor...');
console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
console.log('========================================\n');

// 2. Guardar estado actual de múltiples proyectos
let currentProjectData = {}; // ahora manejamos varios proyectos por room

const startServer = async () => {
  try {
    console.log('🔐 Intentando conectar a PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa con PostgreSQL');

     // ✅ PASO IMPORTANTE: importar modelos y relaciones antes del sync
     console.log('📂 Importando modelos...');
     await import('./models/index.js'); // <- ESTA LÍNEA ES CRÍTICA
     console.log('📂 Modelos importados correctamente');


    console.log('🔄 Sincronizando modelos de base de datos...');
    await sequelize.sync({ alter: true, logging: false });
    console.log('📦 Modelos sincronizados correctamente');

    const { initRoles } = await import('./initRoles.js');
    await initRoles();
    
    const { initDefaultUser } = await import('./initDefaultUser.js');
    await initDefaultUser();

    ////////////////////////////
    const server = http.createServer(app);

    const io = new SocketIOServer(server, {
      cors: { origin: '*' },
    });

    io.on('connection', (socket) => {
      console.log(`🧩 Usuario conectado: ${socket.id}`);

      // El cliente se une a la sala indicada por el roomId
      socket.on('join-room', (roomId) => {
        socket.join(roomId); // El cliente entra en la sala
        console.log(`🛋️ Usuario ${socket.id} unido a sala ${roomId}`);

        // Si ya existe proyecto guardado, le enviamos el estado
        if (currentProjectData[roomId]) {
          socket.emit('load-project', currentProjectData[roomId]);
        }

        // Escuchar actualizaciones
        socket.on('editor-update', (data) => {
          currentProjectData[roomId] = data; // Actualizamos el proyecto
          socket.to(roomId).emit('editor-update', data); // Emitir a otros clientes en la sala
        });
      });

      socket.on('disconnect', () => {
        console.log(`❌ Usuario desconectado: ${socket.id}`);
      });
    });

    // Ruta para generar el proyecto Angular y devolverlo como .zip
    app.post('/generar-proyecto', async (req, res) => {
      try {
        const { html, css, ts } = req.body;

        if (!html || !css || !ts) {
          return res.status(400).send('Faltan datos necesarios (HTML, CSS, TS)');
        }

        // Ruta del directorio del proyecto
        const __dirname = path.resolve(); // Establecemos __dirname correctamente
        const projectDir = path.join(__dirname, "proyecto-angular");

        // Crear la estructura de carpetas del proyecto Angular
        const srcDir = path.join(projectDir, "src", "app", "generated-ui");
        const assetsDir = path.join(projectDir, "src", "assets");

        // Crear los archivos básicos del proyecto
        const angularJsonPath = path.join(projectDir, "angular.json");
        const packageJsonPath = path.join(projectDir, "package.json");
        const tsConfigPath = path.join(projectDir, "tsconfig.json");
        const indexHtmlPath = path.join(projectDir, "src", "index.html");
        const appModulePath = path.join(projectDir, "src", "app", "app.module.ts");

        // Crear las carpetas necesarias
        fs.mkdirSync(srcDir, { recursive: true });
        fs.mkdirSync(assetsDir, { recursive: true });
        fs.mkdirSync(path.join(projectDir, "src"), { recursive: true });

        // Crear los archivos de configuración básicos
        fs.writeFileSync(angularJsonPath, JSON.stringify({
          "version": 1,
          "projects": {
            "angular-project": {
              "projectType": "application",
              "root": "src",
              "sourceRoot": "src",
              "prefix": "app",
              "architect": {
                "build": {
                  "builder": "@angular-devkit/build-angular:browser",
                  "options": {
                    "outputPath": "dist/angular-project",
                    "index": "src/index.html",
                    "main": "src/main.ts",
                    "polyfills": "src/polyfills.ts",
                    "tsConfig": "tsconfig.app.json",
                    "aot": true,
                    "assets": ["src/assets", "src/favicon.ico"],
                    "styles": ["src/styles.css"],
                    "scripts": []
                  }
                }
              }
            }
          },
          "defaultProject": "angular-project"
        }, null, 2));

        fs.writeFileSync(packageJsonPath, JSON.stringify({
          "name": "angular-project",
          "version": "1.0.0",
          "dependencies": {
            "@angular/animations": "^12.2.0",
            "@angular/common": "^12.2.0",
            "@angular/compiler": "^12.2.0",
            "@angular/core": "^12.2.0",
            "@angular/forms": "^12.2.0",
            "@angular/platform-browser": "^12.2.0",
            "@angular/platform-browser-dynamic": "^12.2.0",
            "@angular/router": "^12.2.0",
            "rxjs": "^6.6.0",
            "tslib": "^2.3.0",
            "zone.js": "^0.11.4"
          },
          "devDependencies": {
            "@angular/cli": "^12.2.0",
            "@angular/compiler-cli": "^12.2.0",
            "typescript": "^4.3.5"
          },
          "scripts": {
            "ng": "ng",
            "start": "ng serve",
            "build": "ng build",
            "test": "ng test",
            "lint": "ng lint",
            "e2e": "ng e2e"
          },
          "private": true
        }, null, 2));

        fs.writeFileSync(tsConfigPath, JSON.stringify({
          "compilerOptions": {
            "target": "es2020",
            "module": "esnext",
            "moduleResolution": "node",
            "lib": ["es2020"],
            "outDir": "./out-tsc",
            "declaration": false,
            "sourceMap": true,
            "strict": true,
            "noImplicitAny": true,
            "esModuleInterop": true,
            "skipLibCheck": true,
            "forceConsistentCasingInFileNames": true
          },
          "angularCompilerOptions": {
            "strictTemplates": true
          }
        }, null, 2));

        fs.writeFileSync(indexHtmlPath, `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Angular Project</title>
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>`);

        // Crear el archivo app.module.ts
        fs.writeFileSync(appModulePath, `import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { GeneratedUIComponent } from './generated-ui/generated-ui.component';

@NgModule({
  declarations: [
    AppComponent,
    GeneratedUIComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }`);

        // Ahora agregamos el archivo de código generado (HTML, CSS, TS) al componente

        const componentHtmlPath = path.join(srcDir, "generated-ui.component.html");
        const componentCssPath = path.join(srcDir, "generated-ui.component.css");
        const componentTsPath = path.join(srcDir, "generated-ui.component.ts");

        fs.writeFileSync(componentHtmlPath, html);
        fs.writeFileSync(componentCssPath, css);
        fs.writeFileSync(componentTsPath, ts);

        // Crear el archivo .zip
        const zipPath = path.join(__dirname, "proyecto-angular.zip"); // Usar la ruta correcta para el archivo ZIP
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        // Pipe los datos del archivo ZIP
        archive.pipe(output);

        // Agregar todo el proyecto Angular al archivo .zip
        archive.directory(projectDir, false);  // Agregar todo el proyecto Angular

        // Finaliza el archivo .zip
        archive.finalize();

        // Esperar que el archivo se termine de generar
        output.on("close", () => {
          // Enviar el archivo .zip como respuesta
          res.download(zipPath, "proyecto-angular.zip", (err) => {
            if (err) {
              console.error("Error al enviar el archivo:", err);
            }
            // Limpiar los archivos generados después de la descarga
            fs.rmSync(zipPath); // Eliminar el archivo .zip después de la descarga
            fs.rmSync(projectDir, { recursive: true, force: true }); // Limpiar el directorio del proyecto también
          });
        });
      } catch (error) {
        console.error("Error generando el proyecto:", error);
        res.status(500).send("Error generando el proyecto");
      }
    });

    server.listen(PORT, () => {
      console.log('\n========================================');
      console.log(`🚀 Servidor Express + WebSocket listo en http://localhost:${PORT}`);
      console.log('========================================\n');
    });

    process.on('SIGTERM', () => {
      console.log('🛑 Recibido SIGTERM. Cerrando servidor...');
      server.close(() => {
        sequelize.close();
        console.log('🔌 Servidor y conexión DB cerrados');
      });
    });

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO DURANTE EL INICIO:');
    console.error('Tipo:', error.name);
    console.error('Mensaje:', error.message);

    if (error.original) {
      console.error('\n🔍 Error original (DB):');
      console.error('Código:', error.original.code);
      console.error('Detalle:', error.original.detail);
    }

    console.error('\n🛑 Servidor no pudo iniciarse. Saliendo...');
    process.exit(1);
  }
};

startServer();
