# Discord Bot Setup - Vercel Serverless

Discord bot para claude-code-templates integrado con Vercel Functions usando webhooks. Este enfoque es más eficiente que mantener un bot tradicional con conexión persistente.

## 🚀 Ventajas de la Arquitectura Serverless

- ✅ **Sin servidor permanente**: Solo se ejecuta cuando hay interacciones
- ✅ **Escalabilidad automática**: Vercel maneja el scaling
- ✅ **Integrado con tu infraestructura**: Mismo proyecto, mismo deployment
- ✅ **Costo reducido**: Solo pagas por ejecuciones reales
- ✅ **Cache inteligente**: Reutiliza datos entre invocaciones

## 📋 Comandos Disponibles

### Comandos Básicos (Fase 1)

1. **`/search <query> [type]`** - Buscar componentes
2. **`/info <name> [type]`** - Información detallada
3. **`/install <name> [type]`** - Comando de instalación
4. **`/popular <type> [limit]`** - Componentes más populares
5. **`/random <type>`** - Descubre componentes aleatorios

## 🛠️ Setup Paso a Paso

### 1. Crear Discord Application

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" y dale un nombre
3. En la sección "General Information":
   - Copia el **Application ID** → Esto es tu `DISCORD_APP_ID`
4. Ve a la sección "Bot":
   - Click "Add Bot"
   - Copia el **Bot Token** → Esto es tu `DISCORD_BOT_TOKEN`
   - Habilita "Message Content Intent" si lo necesitas
5. En "General Information" nuevamente:
   - Copia el **Public Key** → Esto es tu `DISCORD_PUBLIC_KEY`

### 2. Configurar Variables de Entorno

#### En Local (para testing)

Crea/actualiza tu archivo `.env`:

```bash
# Discord Bot Configuration
DISCORD_APP_ID=123456789012345678
DISCORD_BOT_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4.AbCdEf.GhIjKlMnOpQrStUvWxYz
DISCORD_PUBLIC_KEY=abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
DISCORD_GUILD_ID=987654321098765432  # Opcional, para testing en un server específico

# API Configuration
COMPONENTS_API_URL=https://aitmpl.com/components.json
```

#### En Vercel (para producción)

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega estas variables:
   - `DISCORD_APP_ID`
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_PUBLIC_KEY`
   - `COMPONENTS_API_URL` (opcional, por defecto usa aitmpl.com)

### 3. Instalar Dependencias

```bash
npm install
```

Esto instalará:

- `discord-interactions` - Para verificar requests de Discord
- `axios` - Para cargar components.json
- `dotenv` - Para variables de entorno

### 4. Registrar Comandos con Discord

```bash
npm run discord:register
```

Output esperado:

```
📦 Registering Discord slash commands...

   Registering to guild: 987654321098765432

✅ Successfully registered 5 commands!

📝 Registered commands:
   1. /search - Search for components by keyword
   2. /info - Get detailed information about a specific component
   3. /install - Get the installation command for a component
   4. /popular - View the most popular components by download count
   5. /random - Discover a random component
```

### 5. Deploy a Vercel

```bash
vercel --prod
```

O usa el deployment automático de GitHub si lo tienes configurado.

Después del deploy, copia tu URL de producción:

```
https://your-project.vercel.app
```

### 6. Configurar Interactions Endpoint en Discord

1. Ve a Discord Developer Portal → Tu aplicación
2. Ve a "General Information"
3. En **Interactions Endpoint URL**, pega:
   ```
   https://your-project.vercel.app/api/discord/interactions
   ```
4. Click "Save Changes"

Discord intentará verificar la URL enviando un PING. Si todo está bien configurado, verás un ✅.

### 7. Invitar el Bot a tu Servidor

1. En Discord Developer Portal → OAuth2 → URL Generator
2. Selecciona scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Selecciona permisos del bot:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Message History
4. Copia la URL generada y ábrela en tu navegador
5. Selecciona tu servidor y autoriza

## 🧪 Testing Local

Para testear localmente antes de hacer deploy:

```bash
# 1. Instala Vercel CLI si no lo tienes
npm i -g vercel

# 2. Inicia el servidor de desarrollo
vercel dev
```

Esto correrá en `http://localhost:3000`

Para que Discord pueda enviar webhooks a tu localhost, necesitas un túnel:

```bash
# Opción 1: ngrok
ngrok http 3000

# Opción 2: Vercel dev con --listen
vercel dev --listen 3000
```

Usa la URL pública del túnel en Discord Interactions Endpoint.

## 📁 Estructura del Proyecto

```
api/
└── discord/
    ├── interactions.js         # Endpoint principal de webhooks
    ├── register-commands.js    # Script para registrar comandos
    ├── handlers/              # Handlers de cada comando
    │   ├── search.js
    │   ├── info.js
    │   ├── install.js
    │   ├── popular.js
    │   └── random.js
    └── utils/                 # Utilidades compartidas
        ├── componentsLoader.js  # Cache de components.json
        └── embedBuilder.js      # Generador de embeds
```

## 🔍 Cómo Funciona

### Flujo de una Interacción

1. Usuario ejecuta `/search security` en Discord
2. Discord envía POST a `https://your-domain.vercel.app/api/discord/interactions`
3. Vercel ejecuta `api/discord/interactions.js`
4. El handler verifica la firma (seguridad)
5. Identifica el comando y llama al handler correspondiente
6. Handler carga components.json (desde cache si existe)
7. Ejecuta la búsqueda y genera un embed
8. Retorna respuesta a Discord
9. Discord muestra el resultado al usuario

### Cache de Componentes

El sistema mantiene `components.json` en memoria por 5 minutos:

- Primera request: Descarga desde aitmpl.com
- Siguientes requests (< 5 min): Usa cache
- Después de 5 min: Actualiza automáticamente

Esto reduce latencia y requests a la API.

## 🐛 Troubleshooting

### Error: "Invalid request signature"

**Causa**: La PUBLIC_KEY no está configurada o es incorrecta

**Solución**:

1. Verifica que `DISCORD_PUBLIC_KEY` esté en las variables de entorno de Vercel
2. Asegúrate de copiar la Public Key correcta del Developer Portal
3. Redeploy después de cambiar variables de entorno

### Error: Discord no puede verificar la URL

**Causa**: El endpoint no responde correctamente al PING

**Solución**:

1. Verifica que el deployment fue exitoso
2. Prueba manualmente: `curl https://your-domain.vercel.app/api/discord/interactions`
3. Revisa los logs en Vercel Dashboard → Functions

### Comandos no aparecen en Discord

**Causa**: No se registraron o falta scope

**Solución**:

1. Ejecuta `npm run discord:register` nuevamente
2. Si usaste `DISCORD_GUILD_ID`, los comandos solo aparecen en ese server
3. Quita el bot del server y vuelve a invitarlo con el scope `applications.commands`
4. Espera unos minutos (comandos globales pueden tardar hasta 1 hora)

### Bot no responde

**Causa**: Error en el handler o falta de permisos

**Solución**:

1. Revisa logs en Vercel Dashboard → Functions
2. Verifica que el bot tenga permisos de "Send Messages" y "Embed Links"
3. Prueba con un comando simple como `/random`

### "Components data not loaded"

**Causa**: No puede acceder a components.json

**Solución**:

1. Verifica que `https://aitmpl.com/components.json` sea accesible
2. Revisa la variable `COMPONENTS_API_URL` si usas una URL custom
3. Chequea los logs de Vercel para ver el error específico

## 📊 Monitoreo

### Vercel Dashboard

Ve a tu proyecto en Vercel → Functions para ver:

- Invocaciones totales
- Errores
- Tiempo de respuesta
- Logs en tiempo real

### Discord Logs

Cada comando registra en consola:

```
🔹 Command received: /search
✅ Components data loaded
```

Revisa estos logs en Vercel Functions.

## 🚀 Próximos Pasos

### Fase 2: Comandos Interactivos

- `/stats` - Estadísticas de la plataforma
- `/new` - Componentes recientes
- `/daily` - Componente del día

### Fase 3: Botones y Menús

- Agregar botones de acción a los embeds
- Select menus para filtros avanzados
- Modal forms para búsqueda compleja

### Fase 4: Integración Avanzada

- Tracking de instalaciones vía Discord
- Notificaciones automáticas de releases
- Sistema de votación y reviews

## 💡 Tips y Mejores Prácticas

1. **Testing**: Usa `DISCORD_GUILD_ID` para testing rápido en tu server
2. **Production**: Quita `DISCORD_GUILD_ID` para comandos globales
3. **Cache**: Ajusta `CACHE_DURATION` en `componentsLoader.js` según tus necesidades
4. **Errores**: Todos los errores retornan embeds ephemeral (solo visibles para el usuario)
5. **Logs**: Los logs en Vercel te ayudan a debuggear problemas en producción

## 📚 Recursos

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord Interactions Documentation](https://discord.com/developers/docs/interactions/receiving-and-responding)
- [Vercel Functions Documentation](https://vercel.com/docs/functions)
- [discord-interactions npm](https://www.npmjs.com/package/discord-interactions)

## 🤝 Soporte

Si tienes problemas:

1. Revisa los logs en Vercel Dashboard
2. Verifica todas las variables de entorno
3. Prueba los endpoints manualmente con curl
4. Abre un issue en GitHub con los logs relevantes

---

**¡Listo!** Tu bot de Discord está corriendo en Vercel Functions 🎉
