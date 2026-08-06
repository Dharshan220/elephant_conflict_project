/*
 * TuskerGuard - ESP8266 (NodeMCU) edge node
 *
 * PIR sensor          -> D1 (GPIO5)
 * Buzzer (active)     -> D6 (GPIO12)
 * Status LED          -> D7 (GPIO13)
 *
 * Behaviour:
 *   1. On PIR HIGH, detect a rising edge, then debounce for 10s and
 *      POST /api/motion to the FastAPI gateway.
 *   2. Poll GET /api/device-command/{DEVICE_ID} every 5s.
 *   3. If a BUZZER_ON command arrives, sound buzzer + strobe LED for
 *      the configured duration, then POST the command ack.
 *
 * In a hackathon lab, run the FastAPI backend on a laptop on the same
 * Wi-Fi network, then set API_HOST to the laptop's LAN IP.
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

#define PIR_PIN   5   // D1
#define BUZZER_PIN 12 // D6
#define LED_PIN   13  // D7 (GPIO13: internal LED is GPIO2, we use D7)

#define DEVICE_ID "esp-02"
#define ZONE_ID   "z2"

const char* WIFI_SSID = "YourWiFiSSID";
const char* WIFI_PASS = "YourWiFiPassword";
const char* API_HOST  = "192.168.1.50";  // laptop running FastAPI
const int   API_PORT  = 8000;

const unsigned long PIR_COOLDOWN_MS = 10000;
const unsigned long POLL_MS         = 5000;
const int          BUZZER_MS        = 30000;

String serverRoot() {
  return String("http://") + API_HOST + ":" + String(API_PORT);
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("[NET] connecting");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.printf("[NET] connected, IP = %s\n", WiFi.localIP().toString().c_str());
}

String httpPost(const String& url, const String& body) {
  WiFiClient client;
  HTTPClient http;
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(body);
  String resp = http.getString();
  http.end();
  Serial.printf("[HTTP] %d %s\n", code, url.c_str());
  return resp;
}

String httpGet(const String& url) {
  WiFiClient client;
  HTTPClient http;
  http.begin(client, url);
  int code = http.GET();
  String resp = http.getString();
  http.end();
  Serial.printf("[HTTP] %d %s\n", code, url.c_str());
  return resp;
}

void reportMotion(int bursts) {
  String json = String("{\"device_id\":\"" DEVICE_ID "\",\"zone_id\":\"" ZONE_ID
                       "\",\"trigger_count\":") + bursts + "}";
  httpPost(serverRoot() + "/api/motion", json);
}

void runDeterrent() {
  Serial.println("[ACT] BUZZER + LED deterrent active");
  unsigned long endAt = millis() + BUZZER_MS;
  while (millis() < endAt) {
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(LED_PIN, HIGH);
    delay(120);
    digitalWrite(LED_PIN, LOW);
    delay(120);
  }
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
}

void pollCommands() {
  String url = serverRoot() + "/api/device-command/" + String(DEVICE_ID);
  String resp = httpGet(url);

  StaticJsonDocument<1024> doc;
  if (deserializeJson(doc, resp)) return;
  JsonArray cmds = doc["commands"];
  for (JsonObject cmd : cmds) {
    const char* type = cmd["type"] | "";
    const char* cmdId = cmd["id"] | "";
    const char* alertId = cmd["alertId"] | "";
    if (strcmp(type, "BUZZER_ON") == 0) {
      Serial.printf("[ACT] BUZZER_ON alert=%s\n", alertId);
      runDeterrent();
      httpPost(serverRoot() + "/api/device-command/" + String(DEVICE_ID) + "/" + cmdId + "/ack",
               "{\"result\":\"executed\"}");
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("\n[ESP8266] TuskerGuard edge node booting...");
  connectWiFi();
}

void loop() {
  static unsigned long lastPir = 0;
  static unsigned long lastPoll = 0;
  static bool pirHigh = false;

  bool pir = digitalRead(PIR_PIN) == HIGH;

  // Rising edge + cooldown -> POST motion event
  if (pir && !pirHigh && millis() - lastPir > PIR_COOLDOWN_MS) {
    lastPir = millis();
    reportMotion(2);
  }
  pirHigh = pir;

  if (millis() - lastPoll > POLL_MS) {
    lastPoll = millis();
    pollCommands();
  }

  // Heartbeat LED
  digitalWrite(LED_PIN, pir ? LOW : HIGH);
  delay(50);
}