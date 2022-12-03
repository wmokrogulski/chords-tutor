let notes = []
let chordNotes = []
let root = null
let chordTypeName = null
let chordInversion = null
let tries = 0
const MAX_TRIES = 3
let score = 0
let bestScore = 0
let hideResponseTimeout = null
let addListenersTimeout = null
let playChordTimeout = null
let questionTimeout = null
let playA4 = true

function setCookie(cname, cvalue, exdays = 365) {
  const d = new Date()
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
  let expires = "expires=" + d.toUTCString()
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"
}

function getCookie(cname) {
  let name = cname + "="
  let decodedCookie = decodeURIComponent(document.cookie)
  let ca = decodedCookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == " ") {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ""
}

function loadNotes() {
  const letters = [
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ]
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  for (const number of numbers) {
    for (const letter of letters) {
      if (number == 0 && ["A", "Bb", "B"].indexOf(letter) == -1) continue
      if (number == 8 && letter !== "C") continue

      const note = `${letter}${number}`
      notes.push(note)
    }
  }
}

function loadSounds() {
  if (!notes.length) loadNotes()
  withA4 = getCookie("withA4")
  if(!withA4.length)
    withA4 = true
  else
    withA4 = !!parseInt(withA4)
  bestScore = getCookie("bestScore")
  if(!bestScore.length) bestScore=0
  updateScore()
  const playBtn = document.getElementById("play")
  clearTimeout(addListenersTimeout)
  addListenersTimeout = setTimeout(() => {
    playBtn.onclick = () => {question(withA4)}
    playBtn.classList.remove("hidden")
    const keys = document.querySelectorAll(".key")
    keys.forEach((key) => {
      key.addEventListener("click", () => checkAnswer(key.id))
    })
  }, 3000)
}

function question(withA4) {
  if(withA4) playNote("A4")
  if (!chordNotes.length) chordNotes = getRandomChord()
  clearTimeout(playChordTimeout)
  playChordTimeout = setTimeout(() => playNotes(chordNotes), 1000)
}

function checkAnswer(key) {
  let msg = ""
  let color = "#dd3333"
  if (root == key) {
    color = "#009900"
    msg = `Bravo\nThat was ${root} ${chordTypeName} in ${chordInversion}.\n`
    tries = 0
    score += 1
    updateScore()
  } else {
    tries++
    if (tries > MAX_TRIES) {
      msg = `That was ${root} ${chordTypeName} in ${chordInversion}.\n`
      tries = 0
    } else {
      respond("Try again!", color)
      question()
    }
  }
  if (tries == 0) {
    respond(`${msg}Try with the next chord!`, color)
    chordNotes = getRandomChord()
    clearTimeout(questionTimeout)
    questionTimeout = setTimeout(() => question(), 1000)
  }
}

function respond(msg, color) {
  const el = document.getElementById("response")
  clearTimeout(hideResponseTimeout)
  el.classList.remove("hidden")
  el.style.backgroundColor = color
  el.innerText = msg
  hideResponseTimeout = setTimeout(() => {
    el.classList.add("hidden")
  }, 4000)
}

function getRandomChord() {
  const letters = [
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ]
  const numbers = [2, 3, 4, 5]
  const randomLetter = letters[Math.floor(Math.random() * letters.length)]
  const randomOctave = numbers[Math.floor(Math.random() * numbers.length)]

  const note = `${randomLetter}${randomOctave}`
  const noteIndex = notes.indexOf(note)
  const chordType = Math.floor(Math.random() * 2) // 0 - major 1 - minor
  chordTypeName = ["major", "minor"][chordType]
  const inversion = Math.floor(Math.random() * 3)
  chordInversion = ["root position", "first inversion", "second inversion"][
    inversion
  ]
  chordNotes = [note]
  switch (chordType) {
    case 0: // major
      switch (inversion) {
        case 0:
          chordNotes.push(notes[noteIndex + 4])
          chordNotes.push(notes[noteIndex + 7])
          break
        case 1:
          chordNotes.push(notes[noteIndex + 3])
          chordNotes.push(notes[noteIndex + 8])
          break
        case 2:
          chordNotes.push(notes[noteIndex + 5])
          chordNotes.push(notes[noteIndex + 9])
          break
      }
      break
    case 1: // minor
      switch (inversion) {
        case 0:
          chordNotes.push(notes[noteIndex + 3])
          chordNotes.push(notes[noteIndex + 7])
          break
        case 1:
          chordNotes.push(notes[noteIndex + 4])
          chordNotes.push(notes[noteIndex + 9])
          break
        case 2:
          chordNotes.push(notes[noteIndex + 5])
          chordNotes.push(notes[noteIndex + 8])
          break
      }
      break
  }
  switch (inversion) {
    case 0:
      root = chordNotes[0]
      break
    case 1:
      root = chordNotes[2]
      break
    case 2:
      root = chordNotes[1]
      break
  }
  root = root.slice(0, root.length - 1)
  return chordNotes
}

function playNote(note) {
  new Audio(`./sounds/${note}.mp3`).play()
}

function playNotes(notes) {
  for (note of notes) {
    playNote(note)
  }
}
function updateScore() {
  document.getElementById("currentScore").innerText = score
  if (score > bestScore) {
    bestScore = score
    setCookie("bestScore", bestScore)
  }
  document.getElementById("bestScore").innerText = bestScore
}
