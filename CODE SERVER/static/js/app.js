// Label
const SEX = {
    0: "Male",
    1: "Female"
}

const EMOTION = {
    0: "Angry",
    1: "Disgusted",
    2: "Fearful",
    3: "Happy",
    4: "Neutral",
    5: "Sad",
    6: "Surprised"
}

const AGE = {
    0: "18",
    1: "19",
    2: "20",
    3: "21",
    4: "22",
    5: "23",
    6: "24",
    7: "25",
    8: "26",
    9: "27",
    10: "28",
    11: "29",
    12: "30",
    13: "31",
    14: "32",
    15: "33",
    16: "34",
    17: "35",
    18: "36",
    19: "37",
    20: "38",
    21: "39",
    22: "40"
}

// Initializing
let button = document.querySelector('#btn-open-camera')
let camera = document.querySelector('#camera')

let sex = document.querySelector('#sex')
let emotion = document.querySelector('#emotion')
let age = document.querySelector('#age')

// Load model
$('document').ready(async function() {

    // Loading model then hiding the loading page
    sex_model = await tf.loadLayersModel('http://localhost:5000/static/gioitinh/model.json')
    emotion_model = await tf.loadLayersModel('http://localhost:5000/static/camxuc/model.json')
    age_model = await tf.loadLayersModel('http://localhost:5000/static/tuoi/model.json')
    document.querySelector('.loading').style.display = 'none'

    // Setting up camera
    let mediaDevices = navigator.mediaDevices
    camera.muted = true
    button.addEventListener('click', () => {
        // Accessing the user camera
        mediaDevices.getUserMedia({
                video: true,
                audio: false
            })
            .then(stream => {
                // Changing the source of video to current stream
                camera.srcObject = stream
                camera.addEventListener('loadedmetadata', () => {
                    camera.play()
                    setTimeout(predict, 100)
                })
            })
            .catch(alert)
    })
})


// Predict function
async function predict() {
    // 1. Convert image to tensor
    let img = tf.browser.fromPixels(camera)
    let sex_tensor = img
        .resizeNearestNeighbor([120, 120])
        .toFloat()
        .div(255.0)
        .expandDims()

    let emotion_tensor = img
        .resizeNearestNeighbor([48, 48])
        .toFloat()
        .div(255.0)
        .expandDims()

    let age_tensor = img
        .resizeNearestNeighbor([80, 80])
        .toFloat()
        .div(255.0)
        .expandDims()

    // 2. Predict
    let sex_predictions = await sex_model.predict(sex_tensor)
    let emotion_predictions = await emotion_model.predict(emotion_tensor)
    let age_predictions = await age_model.predict(age_tensor)

    sex_predictions = sex_predictions.dataSync()
    emotion_predictions = emotion_predictions.dataSync()
    age_predictions = age_predictions.dataSync()

    // 3. Show prediction
    let sex_result = Array.from(sex_predictions)
        .map(function(p, i) {
            return {
                probability: p,
                className: SEX[i]
            }
        })
        .sort(function(a, b) {
            return b.probability - a.probability
        })

    let emotion_result = Array.from(emotion_predictions)
        .map(function(p, i) {
            return {
                probability: p,
                className: EMOTION[i]
            }
        })
        .sort(function(a, b) {
            return b.probability - a.probability
        })

    let age_result = Array.from(age_predictions)
        .map(function(p, i) {
            return {
                probability: p,
                className: AGE[i]
            }
        })
        .sort(function(a, b) {
            return b.probability - a.probability
        })

    // Sex information
    sex.querySelector('.class-name').textContent = sex_result[0].className
    sex.querySelector('progress').value = sex_result[0].probability * 100
    sex.querySelector('.prediction').textContent = (sex_result[0].probability * 100).toFixed(2) + '%'

    // Emotion information
    emotion.querySelector('.class-name').textContent = emotion_result[0].className
    emotion.querySelector('progress').value = emotion_result[0].probability * 100
    emotion.querySelector('.prediction').textContent = (emotion_result[0].probability * 100).toFixed(2) + '%'

    // Age information
    age.querySelector('.class-name').textContent = age_result[0].className + ' years old'
    age.querySelector('progress').value = age_result[0].probability * 100
    age.querySelector('.prediction').textContent = (age_result[0].probability * 100).toFixed(2) + '%'

    setTimeout(predict, 100);
}