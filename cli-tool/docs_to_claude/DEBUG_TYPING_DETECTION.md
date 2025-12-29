# Debug: "User typing..." Detection

## 🔍 Análisis del Problema

Cuando tú escribes, aparecen logs pero no se muestra "User typing..." en pantalla. Hay **3 sistemas** diferentes que pueden detectar typing:

### 1. **Frontend Timeout System** (AgentsPage.js)

```javascript
// Después de mensaje de Assistant → 30s timeout → "User typing..."
this.checkForUserTyping(conversationId);
```

### 2. **Backend File Activity** (FileWatcher.js)

```javascript
// Detecta cambios en ~/.claude/projects/*/conversation.jsonl
this.checkForTypingActivity(conversationId, filePath);
```

### 3. **Backend State Calculator** (StateCalculator.js)

```javascript
// Lógica temporal basada en tiempo transcurrido
return 'User typing...';
```

## 🧪 Test de Debug

### Paso 1: Verificar Logs en Consola del Navegador

Abre DevTools (F12) → Console y busca:

```
🔍 Checking typing for [conversationId]: Xs since last message
⏰ 30s timeout triggered for [conversationId]
✍️ FRONTEND: Setting User typing state for [conversationId]
```

### Paso 2: Verificar Logs del Server

En la terminal donde corre `npm run analytics:start`, busca:

```
✍️ Potential typing activity detected for [conversationId]
📨 Handling conversation change: [conversationId]
```

### Paso 3: Verificar Estado Actual

En consola del navegador, ejecuta:

```javascript
// Ver estado actual del conversation banner
document.querySelector('#state-text').textContent;

// Ver timeouts activos
window.app.components.agents.typingTimeouts.size;

// Ver último tiempo de mensaje
window.app.components.agents.lastMessageTime;
```

## 🔧 Test Manual

1. **Envía un mensaje como usuario** → Banner debe mostrar "Claude Code working..."
2. **Claude responde** → Banner debe mostrar estado basado en contenido
3. **Espera 30 segundos SIN escribir nada** → Banner debe cambiar a "User typing..."
4. **Empieza a escribir** → Verifica logs en ambos lados
5. **Envía mensaje** → Banner debe cambiar inmediatamente a "Claude Code working..."

## 🐛 Posibles Problemas

### A. **Estados Sobrescritos**

- Backend StateCalculator puede estar sobrescribiendo estado frontend
- WebSocket `conversation_state_change` puede resetear el estado

### B. **Timing Conflicts**

- Frontend timeout (30s) vs Backend file detection (2s)
- Múltiples fuentes de verdad para el mismo estado

### C. **Conversation Selection**

- Estado solo se muestra si `this.selectedConversationId === conversationId`
- Verificar que la conversación correcta está seleccionada

## 🔍 Debug Steps Agregados

Agregué logs específicos:

```javascript
console.log('⏱️ Setting 30s timeout for typing detection: ${conversationId}');
console.log('⏰ 30s timeout triggered for ${conversationId}');
console.log('🔍 Checking typing for ${conversationId}: ${timeSinceLastMessage}s');
console.log('✍️ FRONTEND: Setting User typing state for ${conversationId}');
```

## ▶️ Próximos Pasos

1. **Ejecuta nuevamente** `npm run analytics:start`
2. **Haz una conversación** con Claude
3. **Espera 30+ segundos** después de que Claude responda
4. **Verifica logs** tanto en navegador como en terminal
5. **Reporta** qué logs ves y si aparece el estado

¿Qué logs específicos estás viendo cuando escribes?
