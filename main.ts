/**
 * WIFI 使用 P12 P13 上傳與下載
 */
/**
 * (水位感測器:p2  與 p4 馬達)
 */
/**
 * (溫度/濕度感測器:p0)
 */
// A鍵: 檢測溫溼度裝置是否正常運作
// (溫度/濕度感測器:p0)
// - 紅色的溫濕度感測器
// 會顯示
// H: 濕度
// T: 溫度
input.onButtonPressed(Button.A, function () {
    // humidity 濕度
    // temperature 溫度
    dht11_dht22.queryData(
    DHTtype.DHT11,
    DigitalPin.P0,
    true,
    false,
    false
    )
    basic.showString("T:" + dht11_dht22.readData(dataType.temperature) + "*c")
    basic.showString("H:" + dht11_dht22.readData(dataType.humidity) + "%")
})
// B鍵: 檢測水位高度如果觸碰到有數據偏移就代表快滿了
// (水位感測器:p2  與 p4 馬達)
// 會顯示
// W: 水位數據值
input.onButtonPressed(Button.B, function () {
    water_sensor_data = pins.analogReadPin(AnalogPin.P2)
    basic.showString("W:" + water_sensor_data)
})
let water_sensor_data = 0
basic.showLeds(`
    # # # . .
    . # . . .
    . . . . .
    . . . . .
    # . . . .
    `)
// 初始化WIFI
ESP8266ThingSpeak.connectWifi(
SerialPin.P13,
SerialPin.P12,
BaudRate.BaudRate115200,
"ASUS_Yomisana",
"Maciphone510"
)
basic.showLeds(`
    # # # . #
    . # . # #
    . . # # #
    . # # # #
    # # # # #
    `)
if (ESP8266ThingSpeak.isWifiConnected()) {
    basic.showIcon(IconNames.Yes)
} else {
    basic.showIcon(IconNames.No)
}
loops.everyInterval(15000, function () {
    basic.showIcon(IconNames.Asleep)
    water_sensor_data = pins.analogReadPin(AnalogPin.P2)
    // humidity 濕度
    // temperature 溫度
    dht11_dht22.queryData(
    DHTtype.DHT11,
    DigitalPin.P0,
    true,
    false,
    false
    )
    ESP8266ThingSpeak.connectThingSpeak(
    "api.thingspeak.com",
    "OROLZEXWP15PPPSX",
    dht11_dht22.readData(dataType.temperature),
    dht11_dht22.readData(dataType.humidity),
    water_sensor_data,
    0,
    0,
    0,
    0,
    0
    )
    if (ESP8266ThingSpeak.isThingSpeakConnected()) {
        basic.showIcon(IconNames.Happy)
    } else {
        basic.showIcon(IconNames.Sad)
        music.play(music.tonePlayable(131, music.beat(BeatFraction.Quarter)), music.PlaybackMode.InBackground)
        basic.pause(3000)
    }
})
loops.everyInterval(2000, function () {
    if (water_sensor_data >= 300) {
        basic.showLeds(`
            . . . . .
            . . . . .
            . # . # .
            # # # # #
            # # # # #
            `)
        pins.digitalWritePin(DigitalPin.P1, 1)
    } else if (water_sensor_data <= 299) {
        basic.showLeds(`
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            # # # # #
            `)
        pins.digitalWritePin(DigitalPin.P1, 0)
    }
})
