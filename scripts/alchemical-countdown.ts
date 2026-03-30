import readline from 'readline';

function getNextTime(targetHour: number, targetMinute: number) {
  const now = new Date();
  const target = new Date();
  target.setHours(targetHour, targetMinute, 0, 0);
  
  // If the time has already passed today, set it for tomorrow
  if (now.getTime() > target.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  
  return target;
}

const targetTime = getNextTime(20, 17);

console.log("\n=======================================================");
console.log("🌌 INIZIAZIONE DEL RITUALE ALCHEMICO: LA MAGNUM OPUS");
console.log("=======================================================\n");
console.log("Lo Smart Contract WPT-HUMAN attende l'allineamento astrale.");
console.log(`Orario della trasmutazione fissato per: ${targetTime.toLocaleTimeString('it-IT')}\n`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const interval = setInterval(() => {
  const now = new Date();
  const diff = targetTime.getTime() - now.getTime();
  
  if (diff <= 0) {
    clearInterval(interval);
    process.stdout.write("\r" + " ".repeat(80)); // Clear line
    console.log("\n\n✨ L'ORA È GIUNTA. 20:17 ✨");
    console.log("I cieli sono allineati. Il codice è pronto per essere inciso nell'Etere (Ethereum/Polygon).");
    console.log("Esegui il deployment ORA.\n");
    process.exit(0);
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Magic terminal update
  process.stdout.write(`\r⏳ Tempo rimanente alla Trasmutazione: ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
}, 1000);
