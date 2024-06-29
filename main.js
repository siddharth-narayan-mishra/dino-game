import { gsap } from "gsap"

// DOM elements
const dino = document.getElementById("dino")
const obst = gsap.utils.toArray(".obstacle")
const gameOverScreen = document.getElementById("game-over")
const scoreNumber = document.getElementById("score-number")
const restartBtn = document.getElementById("restart-button")
const image = document.getElementById("dino-sprite")
const highestScoreNumber = document.getElementById("highest-score")

// Game state
let score = 0
let highestScore = 0
if(localStorage.getItem("highest-score")){
    highestScore = localStorage.getItem("highest-score")
    highestScoreNumber.innerText = highestScore
}else{
  localStorage.setItem("highest-score",0)
}
let gameOver = false
let objectPassed = false
let sprite = "idle"
let totalFrames = 11
let currentFrame = 0
let animationInterval

// Death animation state
const totalDeathFrames = 9
let deathFrame = 0

//Jump animation state
const totalJumpFrames = 13
let jumpFrame = 0

// Animation timelines
const dinoTl = gsap.timeline()
const obstTl = gsap.timeline()
const groundTl = gsap.timeline()
const mountainTl = gsap.timeline()
const skyTl = gsap.timeline()

// Initialization
function init() {
  restartBtn.addEventListener("click", () => window.location.reload())
  window.addEventListener("keydown", throttle(handleKeydown))
  setupObstacleAnimation()
  setupGroundAnimation()
  setupMountainAnimation()
  setupSkyAnimation()
  startCollisionCheck()
  startSpriteAnimation()
}

// Score functions
function updateScore() {
  score += 10
  scoreNumber.innerText = score
  if (score>highestScore) {
    highestScore=score
  }
  highestScoreNumber.innerText = highestScore
  localStorage.setItem("highest-score",highestScore)
}

// Throttle function
function throttle(callback, delay = 1000) {
  let throttleTimer
  return function () {
    if (throttleTimer) return
    callback.apply(this, arguments)
    throttleTimer = setTimeout(() => {
      throttleTimer = null
    }, delay)
  }
}

// Animation functions
function animateDino() {
  dinoTl.to(dino, {
    y: "-4rem",
    repeat: 1,
    yoyo: true,
  })
}

const throttledAnimateDino = throttle(animateDino)

function setupObstacleAnimation() {
  obstTl.to(obst, {
    x: "-100dvw",
    repeat: -1,
    duration: 3,
    ease: "linear",
  })
  obstTl.pause()
}

function setupGroundAnimation() {
  groundTl.to("#ground", {
    xPercent: -50,
    repeat: -1,
    duration: 3,
    ease: "linear",
  })
  groundTl.pause()
}
function setupMountainAnimation() {
  const imgWidth = document.querySelector("#mountain img").getBoundingClientRect().width

  mountainTl.to("#mountain", {
    x: -imgWidth*2,
    repeat: -1,
    duration: 15,
    ease: "linear",
  })
  mountainTl.pause()
}
function setupSkyAnimation() {
  const imgWidth = document.querySelector("#night-sky img").getBoundingClientRect().width

  skyTl.to("#night-sky", {
    x: -imgWidth*3,
    repeat: -1,
    duration: 25,
    ease: "linear",
  })
  skyTl.pause()
}


// Collision detection
function startCollisionCheck() {
  setInterval(() => {
    if (gameOver) return

    const obstRect = obst[0].getBoundingClientRect()
    const dinoRect = dino.getBoundingClientRect()

    if (checkCollision(obstRect, dinoRect)) {
      endGame()
    }

    if (obstRect.left > dinoRect.right) {
      objectPassed = false
    }

    if (obstRect.right < dinoRect.left && !objectPassed) {
      updateScore()
      objectPassed = true
    }
  }, 100)
}

function checkCollision(obstRect, dinoRect) {
  return (
    dinoRect.bottom > obstRect.top &&
    ((obstRect.left > dinoRect.left && obstRect.left < dinoRect.right) ||
      (obstRect.right > dinoRect.left && obstRect.right < dinoRect.right))
  )
}

function endGame() {
  dinoTl.pause()
  obstTl.pause()
  groundTl.pause()
  mountainTl.pause()
  skyTl.pause()
  gameOver = true
  gameOverScreen.style.display = "flex"
  stopSpriteAnimation()
  playDeathAnimation()
}

//jump animation
let jumpInterval
function playJumpAnimation() {
  stopSpriteAnimation()
  jumpFrame = 2
  jumpInterval = setInterval(() => {
    if (jumpFrame < totalJumpFrames) {
      if (jumpFrame != 0) {
        image.src = `./assets/jump${jumpFrame}.png`
      }
      jumpFrame++
    } else {
      clearInterval(jumpInterval)
      startSpriteAnimation()
    }
  }, 70)
}

// Death animation
function playDeathAnimation() {
  deathFrame = 0
  clearInterval(jumpInterval)
  const deathInterval = setInterval(() => {
    if (deathFrame < totalDeathFrames) {
      if (deathFrame != 0) {
        image.src = `./assets/dead${deathFrame}.png`
      }
      deathFrame++
    } else {
      clearInterval(deathInterval)
    }
  }, 100)
}

// Event handlers
function handleKeydown(e) {
  if (e.key === " " && !gameOver) {
    e.preventDefault()
    if (!obstTl.isActive()) {
      obstTl.play()
      groundTl.play()
      mountainTl.play()
      skyTl.play()
      sprite = "run"
      totalFrames = 9
    } else {
      throttledAnimateDino()
      playJumpAnimation()
    }
  } else if (e.key === " ") {
    window.location.reload()
  }
}

// Sprite animation
function startSpriteAnimation() {
  animationInterval = setInterval(updateFrame, 100)
}

function stopSpriteAnimation() {
  clearInterval(animationInterval)
}

function updateFrame() {
  if (gameOver) return

  currentFrame = (currentFrame + 1) % totalFrames
  if (currentFrame !== 0) {
    image.src = `./assets/${sprite}${currentFrame}.png`
  }
}

// Initialize the game
init()
