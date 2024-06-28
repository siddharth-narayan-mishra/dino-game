import { gsap } from "gsap"

//all DOM elements
const dino = document.getElementById("dino")
const obst = gsap.utils.toArray(".obstacle")
const gameOverScreen = document.getElementById("game-over")
const scoreNumber = document.getElementById("score-number")
const restartBtn = document.getElementById("restart-button")

//restart button logic
restartBtn.addEventListener("click", () => {
  window.location.reload()
})

//score updater
let score = 0
function updateScore() {
  score += 10
  scoreNumber.innerText = score
}

//throttler (general)
let throttleTimer
function throttle(callback, delay = 1000) {
  return function () {
    if (throttleTimer) return

    callback.apply(this, arguments)

    throttleTimer = setTimeout(() => {
      throttleTimer = null
    }, delay)
  }
}

//animations
const dinoTl = gsap.timeline()
const obstTl = gsap.timeline()

function animateDino() {
  dinoTl.to(dino, {
    y: "-4rem",
    repeat: 1,
    yoyo: true,
  })
}
const throttledAnimateDino = throttle(animateDino)

obstTl.to(obst, {
  x: "-100dvw",
  repeat: -1,
  duration: 2,
  stagger: 1.2,
  ease: "linear",
})

//collision checker
let obstRect = obst[0].getBoundingClientRect()
let dinoRect = dino.getBoundingClientRect()

let gameOver = false
let objectPassed = false

setInterval(() => {
  obstRect = obst[0].getBoundingClientRect()
  dinoRect = dino.getBoundingClientRect()
  if (
    !gameOver &&
    dinoRect.bottom > obstRect.top &&
    ((obstRect.left > dinoRect.left && obstRect.left < dinoRect.right) ||
      (obstRect.right > dinoRect.left && obstRect.right < dinoRect.right))
  ) {
    dinoTl.pause()
    obstTl.pause()
    gameOver = true
    gameOverScreen.style.display = "flex"
  }

  if (obstRect.left > dinoRect.right) {
    objectPassed = false
  }

  if (obstRect.right < dinoRect.left && !objectPassed) {
    updateScore()
    objectPassed = true
  }
}, 100)

//make the dino jump
window.addEventListener("keydown", (e) => {
  if (e.key == " ") {
    e.preventDefault()
    throttledAnimateDino()
  }
})
