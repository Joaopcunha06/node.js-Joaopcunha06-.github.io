const fs = require('fs');
const readline = require('readline');
const EventEmitter = require('events');

// Classe personalizada para emitir eventos
class FileProcessor extends EventEmitter {}

// Função para ler o arquivo de forma assíncrona
const readFileAsync = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return data.split('\n');
  } catch (error) {
    throw new Error('Erro ao ler o arquivo: ' + error.message);
  }
};

// Função para processar as linhas
const processFileContent = (lines) => {
  let totalSum = 0;
  let textLinesCount = 0;
  let numberLinesCount = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (/^\d+$/.test(trimmedLine)) {
      // Linha só com números
      totalSum += parseInt(trimmedLine, 10);
      numberLinesCount++;
    } else if (trimmedLine.length > 0) {
      // Linha com texto (mesmo que tenha números)
      textLinesCount++;
    }
  });

  return { totalSum, textLinesCount, numberLinesCount };
};

// Função para perguntar ao usuário se ele deseja rodar novamente
const askToRunAgain = (rl, fileProcessor) => {
  rl.question('\nDeseja executar novamente? (s/n): ', (answer) => {
    if (answer.toLowerCase() === 's') {
      rl.close();
      start(); // Chama novamente a função principal
    } else {
      rl.close();
      console.log('Obrigado por usar a aplicação!');
    }
  });
};

// Função principal que gerencia a execução do processo
const start = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Digite o caminho do arquivo .txt: ', async (filePath) => {
    const fileProcessor = new FileProcessor(); // Instancia o emissor de eventos
    const startTime = Date.now();

    try {
      const lines = await readFileAsync(filePath);
      const { totalSum, textLinesCount, numberLinesCount } = processFileContent(lines);

      const executionTime = (Date.now() - startTime) / 1000; // Tempo de execução em segundos

      // Dispara o evento para mostrar o resumo
      fileProcessor.emit('summary', totalSum, textLinesCount, numberLinesCount, executionTime);

      // Pergunta se o usuário quer rodar novamente
      askToRunAgain(rl, fileProcessor);
    } catch (error) {
      console.error(error.message);
      rl.close();
    }
  });

  // Escuta o evento 'summary' para exibir o resumo
  const fileProcessor = new FileProcessor();
  fileProcessor.on('summary', (totalSum, textLinesCount, numberLinesCount, executionTime) => {
    console.log('\nResumo:');
    console.log(`Soma dos números: ${totalSum}`);
    console.log(`Linhas com texto: ${textLinesCount}`);
    console.log(`Linhas com números: ${numberLinesCount}`);
    console.log(`Tempo de execução: ${executionTime.toFixed(2)} segundos`);
  });
};

// Inicia a aplicação
start();
