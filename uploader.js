/**
 * uploader.js
 * Envio de imagens para o relógio usando curl.exe (com suporte a caminhos com espaços)
 * e configuração automática dos switches de imagem
 */

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Nome do arquivo temporário local para evitar problemas de espaços em disco
const LOCAL_FRAME = 'temp_frame.jpg';
const ABS_FRAME = path.join(__dirname, LOCAL_FRAME);

async function uploadImageToClock(clockIp, imageBuffer) {
  return new Promise((resolve) => {
    try {
      fs.writeFileSync(ABS_FRAME, imageBuffer);
    } catch (e) {
      return resolve({ success: false, error: e.message });
    }

    // Usando caminho local relativo com cwd definido para __dirname
    // Isso evita completamente o erro com espaços em "Contudos gerais"
    const args = [
      '-s',
      '-H', 'Connection: close',
      '--connect-timeout', '3',
      '-m', '8',
      '-F', `imageFile=@${LOCAL_FRAME};type=image/jpeg;filename=file1.jpg`,
      `http://${clockIp}/upload`
    ];

    execFile('curl.exe', args, { cwd: __dirname }, async (err, stdout) => {
      const isOk = !err || (stdout && stdout.includes('Upload successful!'));
      if (!isOk) {
        return resolve({ 
          success: false, 
          error: err ? err.message : 'Falha no upload para o relógio' 
        });
      }

      resolve({ success: true });
    });
  });
}

// Desativa automaticamente as caixas 2, 3, 4 e 5 e ativa a caixa 1
async function cleanClockSlots(clockIp) {
  try {
    console.log(`[Configuração Automática] Limpando slots de fábrica no relógio ${clockIp}...`);
    await httpGet(`http://${clockIp}/file1-switch?getstate=1`);
    await httpGet(`http://${clockIp}/file2-switch?getstate=0`);
    await httpGet(`http://${clockIp}/file3-switch?getstate=0`);
    await httpGet(`http://${clockIp}/file4-switch?getstate=0`);
    await httpGet(`http://${clockIp}/file5-switch?getstate=0`);
    await httpGet(`http://${clockIp}/themeselect?getstate=2`);
    console.log(`[Configuração Automática] Concluído: Apenas file1 ativo em modo Photo.`);
    return { success: true };
  } catch (err) {
    console.error('Aviso ao limpar slots do relógio:', err.message);
    return { success: false, error: err.message };
  }
}

function httpGet(urlStr) {
  return new Promise((resolve, reject) => {
    const req = http.get(urlStr, { timeout: 2500 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function restoreNormalClockMode(clockIp, theme = 0) {
  try {
    await httpGet(`http://${clockIp}/themeselect?getstate=${theme}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function testClockConnection(clockIp) {
  try {
    const success = await httpGet(`http://${clockIp}/`);
    return { success };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function restartClock(clockIp) {
  let wifiTriggered = false;
  let hwTriggered = false;

  // 1. Tenta reiniciar via Wi-Fi (caso o relógio ainda esteja ouvindo a rede)
  try {
    if (clockIp) {
      await httpGet(`http://${clockIp}/restart`).catch(() => {});
      wifiTriggered = true;
    }
  } catch (_) {}

  // 2. Aciona o Hardware Reset via porta Serial USB (COM7) com pulso DTR/RTS
  // Isso funciona SEMPRE, mesmo com o Wi-Fi travado ou desconectado!
  try {
    const psScript = path.join(__dirname, 'reset_serial.ps1');
    if (fs.existsSync(psScript)) {
      await new Promise((resolve) => {
        execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', psScript, '-Port', 'COM7'], (err, stdout) => {
          if (!err && stdout && stdout.includes('SUCCESS')) {
            hwTriggered = true;
          }
          resolve();
        });
      });
    }
  } catch (_) {}

  return {
    success: true,
    message: hwTriggered
      ? 'Relógio reiniciado via Hardware USB (COM7) com sucesso!'
      : (wifiTriggered ? 'Comando de reinicialização enviado via Wi-Fi!' : 'Comando enviado ao relógio!')
  };
}

module.exports = {
  uploadImageToClock,
  cleanClockSlots,
  restoreNormalClockMode,
  testClockConnection,
  restartClock
};
