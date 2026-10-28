<script setup>
const emit = defineEmits(["insert", "action"]);

const keys = [
	["AC", "C", "%", "/"],
	["7", "8", "9", "*"],
	["4", "5", "6", "−"],
	["1", "2", "3", "+"],
	["0", ".", "⌫", "="],
	["sqrt", "^", "pi", "e"],
	["sin", "cos", "tan", "("],
	["asin", "acos", "atan", ")"],
	["log", "ln"],
];

function press(key) {
	if (key === "AC") {
		emit("action", "clear");
	} else if (key === "C") {
		emit("action", "clear-entry");
	} else if (key === "⌫") {
		emit("action", "backspace");
	} else if (key === "=") {
		emit("action", "calculate");
	} else if (key === "sqrt") {
		emit("insert", "sqrt(");
	} else if (key === "pi") {
		emit("insert", "pi");
	} else if (key === "e") {
		emit("insert", "e");
	} else if (key === "−") {
		emit("insert", "-");
	} else if (["sin", "cos", "tan", "asin", "acos", "atan", "log", "ln"].includes(key)) {
		emit("insert", `${key}(`);
	} else {
		emit("insert", {
			value: key,
			startsNewExpression: /^\d$|^\.$/.test(key),
		});
	}
}

function keyId(key) {
	return (
		{
			AC: "clear-all",
			C: "clear-entry",
			"⌫": "backspace",
			"=": "calculate",
			sqrt: "sqrt",
			")": "right-parenthesis",
			"(": "left-parenthesis",
			"/": "divide",
			"*": "multiply",
			"−": "subtract",
			"+": "add",
		}[key] || key
	);
}
</script>

<template>
	<div class="calculator-keypad">
		<button
			v-for="key in keys.flat()"
			:key="key"
			type="button"
			class="calculator-key"
			:data-calculator-key="keyId(key)"
			:class="{
				'is-action': ['AC', 'C', '⌫'].includes(key),
				'is-operator': ['/', '*', '−', '+'].includes(key),
				'is-equals': key === '=',
			}"
			@click="press(key)"
		>
			{{ { "/": "÷", "*": "×", sqrt: "√x" }[key] || key }}
		</button>
	</div>
</template>

<style scoped>
.calculator-keypad {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 5px;
}

.calculator-key {
	display: flex;
	width: 100%;
	min-width: 0;
	height: 40px;
	align-items: center;
	justify-content: center;
	border: 1px solid #111;
	border-radius: 10px;
	background: #fff;
	color: #111;
	font-size: 17px;
	font-weight: 600;
	cursor: pointer;
	transition: background-color 120ms ease, transform 100ms ease;
}

.calculator-key:hover {
	background: #e8e8e8;
}

.calculator-key:active {
	transform: scale(0.96);
}

.calculator-key:focus-visible {
	outline: 3px solid #777;
	outline-offset: 2px;
}

@media (max-width: 360px) {
	.calculator-keypad {
		gap: 4px;
	}

	.calculator-key {
		height: 36px;
	}
}
</style>
