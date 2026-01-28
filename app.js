const ledRing = document.getElementById("led-ring");
const runButton = document.getElementById("run-button");
const stopButton = document.getElementById("stop-button");
const loadSampleButton = document.getElementById("load-sample");
const lightSensor = document.getElementById("light-sensor");
const soundSensor = document.getElementById("sound-sensor");
const boardButtons = document.querySelectorAll(".board-button");

const ledCount = 10;
const leds = [];
let workspace = null;
let running = false;
let loopInterval = null;

const defaultColors = ["#00c8ff", "#f7b500", "#ff5c8d", "#6eff8b", "#7f7bff"];

function createLedRing() {
  ledRing.innerHTML = "";
  for (let index = 0; index < ledCount; index += 1) {
    const led = document.createElement("div");
    led.classList.add("led");
    led.dataset.index = index;
    ledRing.appendChild(led);
    leds.push(led);
  }
}

function setAllLeds(color) {
  leds.forEach((led) => {
    led.style.background = color;
  });
}

function clearLeds() {
  leds.forEach((led) => {
    led.style.background = "#39424f";
  });
}

function pulseLeds() {
  let step = 0;
  loopInterval = setInterval(() => {
    const color = defaultColors[step % defaultColors.length];
    setAllLeds(color);
    step += 1;
  }, 700);
}

function stopRun() {
  running = false;
  clearInterval(loopInterval);
  loopInterval = null;
  clearLeds();
}

function runProgram() {
  if (!workspace) return;
  stopRun();
  running = true;

  const topBlocks = workspace.getTopBlocks(true);
  const foreverBlock = topBlocks.find((block) => block.type === "forever_loop");
  const sampleColorBlock = topBlocks.find((block) => block.type === "set_all_lights");

  if (foreverBlock) {
    pulseLeds();
    return;
  }

  if (sampleColorBlock) {
    const color = sampleColorBlock.getFieldValue("COLOR") || "#00c8ff";
    setAllLeds(color);
    return;
  }

  setAllLeds("#f7b500");
}

function initBlockly() {
  const toolbox = {
    kind: "categoryToolbox",
    contents: [
      { kind: "category", name: "Light", colour: "#00a8cc", contents: [
        { kind: "block", type: "set_all_lights" },
        { kind: "block", type: "set_light_at" },
        { kind: "block", type: "clear_lights" },
      ]},
      { kind: "category", name: "Input", colour: "#f36c21", contents: [
        { kind: "block", type: "on_button_pressed" },
        { kind: "block", type: "read_light_sensor" },
        { kind: "block", type: "read_sound_sensor" },
      ]},
      { kind: "category", name: "Music", colour: "#d94f70", contents: [
        { kind: "block", type: "play_tone" },
      ]},
      { kind: "category", name: "Loops", colour: "#22aa44", contents: [
        { kind: "block", type: "forever_loop" },
        { kind: "block", type: "repeat_times" },
      ]},
      { kind: "category", name: "Logic", colour: "#5c7cfa", contents: [
        { kind: "block", type: "controls_if" },
        { kind: "block", type: "logic_compare" },
      ]},
      { kind: "category", name: "Variables", colour: "#ff8a00", custom: "VARIABLE" },
      { kind: "category", name: "Math", colour: "#934fe8", contents: [
        { kind: "block", type: "math_number" },
        { kind: "block", type: "math_arithmetic" },
      ]},
      { kind: "category", name: "Functions", colour: "#5c940d", custom: "PROCEDURE" },
    ],
  };

  workspace = Blockly.inject("blockly-workspace", {
    toolbox,
    grid: {
      spacing: 24,
      length: 3,
      colour: "#3b4250",
      snap: true,
    },
    theme: Blockly.Themes.Classic,
  });

  Blockly.defineBlocksWithJsonArray([
    {
      type: "forever_loop",
      message0: "forever %1 do %2",
      args0: [
        { type: "input_dummy" },
        { type: "input_statement", name: "DO" },
      ],
      colour: "#22aa44",
      tooltip: "Repeat blocks forever",
      nextStatement: null,
    },
    {
      type: "repeat_times",
      message0: "repeat %1 times %2 do %3",
      args0: [
        { type: "field_number", name: "TIMES", value: 5, min: 1, max: 100 },
        { type: "input_dummy" },
        { type: "input_statement", name: "DO" },
      ],
      colour: "#22aa44",
      tooltip: "Repeat blocks a certain number of times",
      nextStatement: null,
      previousStatement: null,
    },
    {
      type: "set_all_lights",
      message0: "set all lights to %1",
      args0: [{ type: "field_colour", name: "COLOR", colour: "#00c8ff" }],
      colour: "#00a8cc",
      previousStatement: null,
      nextStatement: null,
    },
    {
      type: "set_light_at",
      message0: "set light %1 to %2",
      args0: [
        { type: "field_number", name: "INDEX", value: 0, min: 0, max: 9 },
        { type: "field_colour", name: "COLOR", colour: "#ff5c8d" },
      ],
      colour: "#00a8cc",
      previousStatement: null,
      nextStatement: null,
    },
    {
      type: "clear_lights",
      message0: "clear lights",
      colour: "#00a8cc",
      previousStatement: null,
      nextStatement: null,
    },
    {
      type: "on_button_pressed",
      message0: "on button %1 pressed %2 do %3",
      args0: [
        { type: "field_dropdown", name: "BUTTON", options: [["A", "A"], ["B", "B"]] },
        { type: "input_dummy" },
        { type: "input_statement", name: "DO" },
      ],
      colour: "#f36c21",
      nextStatement: null,
    },
    {
      type: "read_light_sensor",
      message0: "light sensor value",
      output: "Number",
      colour: "#f36c21",
    },
    {
      type: "read_sound_sensor",
      message0: "sound sensor value",
      output: "Number",
      colour: "#f36c21",
    },
    {
      type: "play_tone",
      message0: "play tone %1 Hz for %2 ms",
      args0: [
        { type: "field_number", name: "FREQ", value: 440, min: 50, max: 2000 },
        { type: "field_number", name: "DURATION", value: 200, min: 50, max: 2000 },
      ],
      colour: "#d94f70",
      previousStatement: null,
      nextStatement: null,
    },
  ]);

  const initialXml = `
    <xml xmlns="https://developers.google.com/blockly/xml">
      <block type="forever_loop" x="40" y="40">
        <statement name="DO">
          <block type="set_all_lights">
            <field name="COLOR">#00c8ff</field>
          </block>
        </statement>
      </block>
    </xml>`;

  Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(initialXml), workspace);
}

function handleSensorChange() {
  const lightValue = Number(lightSensor.value);
  const soundValue = Number(soundSensor.value);
  document.documentElement.style.setProperty("--light-value", lightValue);
  document.documentElement.style.setProperty("--sound-value", soundValue);
}

boardButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!running) return;
    const color = button.dataset.button === "A" ? "#ff5c8d" : "#6eff8b";
    setAllLeds(color);
  });
});

runButton.addEventListener("click", runProgram);
stopButton.addEventListener("click", stopRun);
loadSampleButton.addEventListener("click", () => {
  if (!workspace) return;
  workspace.clear();
  const sampleXml = `
    <xml xmlns="https://developers.google.com/blockly/xml">
      <block type="repeat_times" x="40" y="40">
        <field name="TIMES">6</field>
        <statement name="DO">
          <block type="set_light_at">
            <field name="INDEX">3</field>
            <field name="COLOR">#ff5c8d</field>
            <next>
              <block type="set_light_at">
                <field name="INDEX">7</field>
                <field name="COLOR">#6eff8b</field>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`;
  Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(sampleXml), workspace);
});

lightSensor.addEventListener("input", handleSensorChange);
soundSensor.addEventListener("input", handleSensorChange);

createLedRing();
initBlockly();
handleSensorChange();
