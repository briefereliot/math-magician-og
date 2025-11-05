// GLOBAL CONSTANTS 
const MIXED = 'Mixed';
const COMPLEX = 'complex';
const MULTIPLY_DIVIDE = 'multiplication_division' //ADDED BY ELIOT

const NORMAL_ROUND_COUNT = 20;
const MIXED_ROUND_COUNT = 100;

const NORMAL_TIMER_TIME = 60;
const MIXED_TIMER_TIME = 60 * 5;

const NORMAL_DESCRIPTION_TEXT = 'Answer 20 questions in 1 minute';
const MIXED_DESCRIPTION_TEXT = 'Answer 100 questions in 5 minutes';

const DEFAULT_TASK = 5;
const PASS_PERCENTAGE = 50; 

const MODES = {
  addition: {
    title: 'Addition',
    operator: '+',
    entity: '&plus;',
    certificatePath: "./assets/docs/multiplication-certificate.pdf"
  },
  subtraction: {
    title: 'Subtraction',
    operator: '-',
    entity: '&minus;',
    certificatePath: "./assets/docs/multiplication-certificate.pdf"
  },
  multiplication: {
    title: 'Multiplication',
    operator: 'x',
    entity: '&times;',
    certificatePath: "./assets/docs/multiplication-certificate.pdf"
  },
  division: {
    title: 'Division',
    operator: '/',
    entity: '&divide;',
    certificatePath: "./assets/docs/multiplication-certificate.pdf"
  },

  //ADDED BY ELIOT 2025-11-04
  multiplication_division: {
    title: 'Multiply and Divide Mixed',
    operator: '',
    entity: '',
    certificatePath: "./assets/docs/multiplication-certificate.pdf"
  },

  complex: {
    title: 'Complex Mixed',
    operator: '',
    entity: '',
    certificatePath: "./assets/docs/multiplication-certificate.pdf"
  }
}

// CLASSES
class Timer {
  constructor() {
    this.defaultTime = NORMAL_TIMER_TIME;
    this.time = this.defaultTime;
    this.element = document.querySelector('[data-timer="seconds"]'); 
    this.fill = document.querySelector('[data-timer="fill"]');
   
    this.hasEnded = false;
  }

  setTime(time){
    this.defaultTime = time;
    this.time = time;
  }
  
  start() {
    this.interval = setInterval(() => this.update(), 1000);
  }
  
  update() {    
    this.element.innerText = this.formatTime(--this.time);    
    this.fill.style.setProperty('--width', this.time / this.defaultTime * 100);
      
    if (this.time == 0) {
      clearInterval(this.interval);
      timeUp();
      this.hasEnded = true;
    } 
  }

  formatTime(time){
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  reset(){
    clearInterval(this.interval);
    this.time = this.defaultTime;
    this.element.innerText = this.time;
    this.hasEnded = false;

    this.fill.style.setProperty('--width', 100);
  }
  stop(){
    clearInterval(this.interval);
  }
}

class Game {
  constructor(){
    this.currentRound = 0;
    this.totalRounds = NORMAL_ROUND_COUNT;
    this.currentRoundSpan = document.querySelector('[ data-game="round"]');
    this.totalRoundSpan = document.querySelector('[ data-game="total-round"]');

    this.value1Span = document.querySelector('[data-game="value-1"]');
    this.value2Span = document.querySelector('[data-game="value-2"]');
    this.operatorSpan = document.querySelector('[data-game="operator"]'); 
    
    this.operator = null; // +, -, x, /
    this.mode = null; // add, sub, mul, div
    this.task = null; // 1, 2 ... 10

    this.numbers = [];

    this.round = {
      value1: 0,
      value2: 0,
      operator: null,
    }
    this.correct = 0;
  }

  setMode(mode){
    this.mode = mode;
    this.operator = MODES[mode].operator;

    if(mode === COMPLEX) this.task = MIXED;
    if(mode === MULTIPLY_DIVIDE) this.task = MIXED;
  }

  setTask(task){
    if(task === MIXED){
      this.task = task;
      this.totalRounds = MIXED_ROUND_COUNT;
      timer.setTime(MIXED_TIMER_TIME);
    } 
    else {
      this.task = parseInt(task);
      this.totalRounds = NORMAL_ROUND_COUNT;
      timer.setTime(NORMAL_TIMER_TIME);
    }
    this.resetNumberArray();
    this.totalRoundSpan.innerText = this.totalRounds;
  }

  resetNumberArray(){
    this.digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    this.numbers = [];
    for(let i = 0; i < Math.ceil(this.totalRounds / 10); i++){
      this.numbers.push(...this.digits.sort(() => 0.5 - Math.random()));
    }
  }

  reset(){
    this.resetNumberArray();  
    this.currentRound = 0; 
    this.correct = 0;
  }

  nextRound(){
    this.currentRound++;
    this.setupRound();
    this.update();
  }

  //METHOD CHANGED TO TAKE OPTIONS ARRAY AS PARAMETER FOR FLEXIBILITY
  randomizeOperator(options = 
    [MODES.addition.operator,
      MODES.subtraction.operator,
      MODES.multiplication.operator,
      MODES.division.operator]){

    this.operator = options[this.getRandomNumberBetween(0, options.length - 1)];
  }
  
  setupRound(){
    if(this.mode === COMPLEX) this.randomizeOperator();
    if(this.mode === MULTIPLY_DIVIDE) this.randomizeOperator([MODES.multiplication.operator, MODES.division.operator]); //ADDED BY ELIOT

    this.round.value1 = this.task === MIXED? this.getRandomNumberBetween() : this.numbers[this.currentRound - 1];
    this.round.value2 = this.task === MIXED? this.getRandomNumberBetween() : this.task;
    this.round.operator = this.operator;

    if(this.operator === MODES.subtraction.operator){
      this.round.value1 += this.round.value2;
    }
    if(this.operator === MODES.division.operator){
      this.round.value1 *= this.round.value2;
    }
  }

  update(){
    this.currentRoundSpan.innerText = this.currentRound;

    this.value1Span.innerText = this.round.value1;
    this.value2Span.innerText = this.round.value2;
    this.operatorSpan.innerHTML = this.getOperatorEntity();
  }

  getOperatorEntity(){
    if((this.mode != COMPLEX) && (this.mode != MULTIPLY_DIVIDE)) return MODES[this.mode].entity; //MODIFIED BY ELIOT
    const mode = Object.keys(MODES).find(mode =>  MODES[mode].operator == this.operator);
    return MODES[mode].entity;
  }

  // if operator is / the min value is 1
  getRandomNumberBetween(min = this.operator == MODES.division.operator, max = 10){
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  checkAnswer(answer){
    switch(this.operator){
      case MODES.addition.operator:
        return this.round.value1 + this.round.value2 === answer;

      case MODES.subtraction.operator:
        return this.round.value1 - this.round.value2 === answer;
      
      case MODES.multiplication.operator:
        return this.round.value1 * this.round.value2 === answer;
      
      case MODES.division.operator:
        return this.round.value1 / this.round.value2 === answer;
      
      default:
        return false;
    }    
  }

  getGameText(){
    return `${MODES[this.mode].title} Facts ${this.task === MIXED ? 'Mixed' : `${MODES[this.mode].operator}${this.task}`}`;
  }
}


// GLOBAL VARIABLES
let currentTask;
let activeSection;
let username = ''; 

const timer = new Timer();
const game = new Game();

// HTML SELECTORS
const options = document.querySelectorAll('[data-option]');

const currentTaskSpan = document.querySelector('[data-current-task]');
const headerTaskSpan = document.querySelector('[data-game="type"]');
const gameModeSpans = document.querySelectorAll('[data-game="mode"]');
const descriptionSpan = document.querySelector('[data-game="description"]');

const nameInput = document.querySelector('[data-name]');

const gameModes = document.querySelectorAll('[data-mode]');
const proceedButton = document.querySelector('[data-button="proceed"]');
const startButton = document.querySelector('[data-button="start"]');
const restartButton = document.querySelector('[data-button="restart"]');
const againButton = document.querySelector('[data-button="again"]');
const backButton = document.querySelector('[data-button="back"]');
const certificateButton = document.querySelector('[data-button="certificate"]');

const sections = {
  home: document.querySelector('[data-section="home"]'),
  menu: document.querySelector('[data-section="menu"]'),
  game: document.querySelector('[data-section="game"]'),
  result: document.querySelector('[data-section="result"]'),
  certificate: document.querySelector('[data-section="certificate"]')
}

const gameForm = document.querySelector('[data-game="form"]');
const answerInput = document.querySelector('[data-game="answer"]');

const gameMain = document.querySelector('[data-game="main"]');
const timeUpText = document.querySelector('[data-timer="time-up"]'); 

const resultGameType = document.querySelector('[data-result="game-type"]'); 
const resultPercent = document.querySelector('[data-result="percent"]');
const resultMessage = document.querySelector('[data-result="message"]');
const resultPrintSection = document.querySelector('[data-result="print"]');
const resultTime = document.querySelector('[data-result="time"]');


// EVENT LISTENERS
options.forEach(option => option.addEventListener('click', () => setCurrentTask(option.dataset.option)));
gameModes.forEach(modeBtn => modeBtn.addEventListener('click', () => setGameMode(modeBtn)));


proceedButton.addEventListener('click', initMenu);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
againButton.addEventListener('click', restartGame);
backButton.addEventListener('click', () => gotoSection(sections.home));
certificateButton.addEventListener('click', generateCertificate);

gameForm.addEventListener('submit', (e) => checkAnswer(e));

window.addEventListener('load', setup);

// FUNCTIONS
function setup(){
  setGameMode(gameModes[0]);
  setCurrentTask(DEFAULT_TASK);
  activeSection = sections.home;
  nameInput.focus();
}

function setCurrentTask(task) {
  game.setTask(task);
  const text = (game.task === MIXED) ? MIXED : `${MODES[game.mode].entity}${game.task}`;
  currentTaskSpan.innerHTML = text;
  headerTaskSpan.innerHTML = text;
  descriptionSpan.innerHTML = (game.task === MIXED) ? MIXED_DESCRIPTION_TEXT : NORMAL_DESCRIPTION_TEXT; 
}

function setGameMode(modeButton){
  game.setMode(modeButton.dataset.mode);
  gameModeSpans.forEach(s => s.innerText = MODES[game.mode].title);
  gameModes.forEach(button => button.classList.remove('active'));
  modeButton.classList.add('active');
  setCurrentTask(game.task); 
}

function initMenu(){
  if(nameInput.value == '') {
    nameInput.focus()
    return alert('Please enter your name');
  } 
  username = nameInput.value;
  if(game.mode === COMPLEX || game.mode === MULTIPLY_DIVIDE) {
    headerTaskSpan.innerHTML = "";
    startGame();
  } 
  else {
    options.forEach(option => {
      const value = option.dataset.option
      if(value == MIXED) return;
      
      option.innerHTML = `${MODES[game.mode].entity}${value}`;
    })
    gotoSection(sections.menu);
  }
}

function startGame() {
  gotoSection(sections.game);
  timer.start();
  game.nextRound();
  answerInput.focus()
}

function restartGame(){
  game.reset();
  timer.reset();
  gameMain.classList.remove('hidden');
  timeUpText.classList.add('hidden');
  gotoSection(sections.menu);
}

function gotoSection(section) {
  activeSection.classList.remove('active');
  activeSection = section;
  activeSection.classList.add('active');
}

function checkAnswer(e) {
  e.preventDefault(); 
  if(answerInput.value === '') return;

  const answer = parseInt(answerInput.value);
  answerInput.value = '';
  
  if(game.checkAnswer(answer)) 
    game.correct++;
  
  if(game.currentRound === game.totalRounds) 
    endGame();
  else
    game.nextRound(); 
}

function timeUp(){
  gameMain.classList.add('hidden');
  timeUpText.classList.remove('hidden');
}

function setUpResultScreen(){
  const percentage = Math.round((game.correct / game.totalRounds) * 100);
  resultGameType.innerText = game.getGameText();
  resultPercent.innerText = `${percentage}%`;
  resultMessage.innerText = (game.correct / game.totalRounds) * 100 >= PASS_PERCENTAGE ? 'Congratulations!' : 'Better luck next time!';
  resultTime.innerText = `Completed in ${getTimeText()}`;
  if(percentage == 100) resultPrintSection.classList.remove('hidden');
}

function getTimeText(){
  const totalTime = timer.defaultTime;
  const usedTime = totalTime - timer.time;
  const minutes = Math.floor(usedTime / 60);
  const seconds = usedTime % 60;

  return `${minutes} minutes and ${seconds} seconds`;
}

function endGame() {
  timer.stop();
  setUpResultScreen();
  gotoSection(sections.result);
}
// CUSTOM PDF SECTION
const { PDFDocument, rgb, degrees } = PDFLib;

async function generateCertificate(){
  try {
    const path = MODES[game.mode].certificatePath;
    const pdfName = `${MODES[game.mode].title}_certificate_${getUSDate()}.pdf`; 

    const pdfResult = await fetch(path);
    const existingPdfBytes =  await pdfResult.arrayBuffer();

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);
      
    //get font
    const fontResult = await fetch("./assets/fonts/Zelda.ttf")
    const fontBytes = await fontResult.arrayBuffer();

    // Embed our custom font in the document
    const ZeldaFont  = await pdfDoc.embedFont(fontBytes);

    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
  
    // Draw a texts on the certificate
    firstPage.drawText(username, {
      x: 410 - username.length * 9,
      y: 435,
      size: 36,
      font: ZeldaFont,
      color: rgb(0.752, 0.015, 0.003),
      rotate: degrees(0)
    });

    firstPage.drawText(getTimeText(), {
      x: 350,
      y: 255,
      size: 22,
      font: ZeldaFont,
      color: rgb(0, 0.2, 0.6),
      rotate: degrees(0)
    });

    firstPage.drawText(getUSDate(), {
      x: 330,
      y: 145,
      size: 22,
      font: ZeldaFont,
      color: rgb(0, 0.2, 0.6),
      rotate: degrees(0)
    });

    const taskText = `${MODES[game.mode].title} Facts ${game.task === MIXED ? 'Mixed' : `${MODES[game.mode].operator}${game.task}`}`; 
    firstPage.drawText(taskText, {
      x: 290,
      y: 200,
      size: 24,
      font: ZeldaFont,
      color: rgb(0, 0, 0),
      rotate: degrees(0)
    });
  
    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
    saveAs(pdfDataUri, pdfName);    
  } catch (error) {
    console.error(error);
    alert('Something went wrong while generating the certificate, please try again using another browser!', error.message);
  }
}

function getUSDate(){
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}