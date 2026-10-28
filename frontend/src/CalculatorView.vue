<template>
	<main class="calculator-page">
		<div class="calculator-container">
			<header class="calculator-heading">
				<h1>Calculator</h1>
			</header>

			<section aria-label="Calculator workspace">
				<section class="calculator-card">
					<!--
            TextInput rather than FormControl: the view drives the caret directly
            (select, setSelectionRange, selectionStart) and needs the component's
            exposed `el`, which FormControl does not forward.
          -->
					<div>
						<label for="calculator-expression" class="visually-hidden">
							Expression
						</label>

						<input
							id="calculator-expression"
							ref="expressionField"
							type="text"
							:value="expression"
							class="calculator-display"
							:aria-invalid="Boolean(errorMessage)"
							:aria-describedby="
								errorMessage ? 'calculator-error' : 'calculator-keyboard-hint'
							"
							placeholder="Example: sqrt(81) + sin(30)"
							inputmode="decimal"
							autocapitalize="off"
							spellcheck="false"
							@input="calculator.updateExpression($event.target.value)"
							@keydown="handleInputKeydown"
						/>

						<p
							v-if="errorMessage"
							id="calculator-error"
							class="calculator-error"
							role="alert"
						>
							{{ errorMessage }}
						</p>
					</div>

					<div class="calculator-result-area">
						<div class="min-w-0 flex-1">
							<p class="calculator-result-label">Result</p>
							<output
								class="calculator-result"
								aria-label="Calculation result"
								aria-live="polite"
							>
								{{ result || "—" }}
							</output>
						</div>
					</div>

					<CalculatorKeypad @insert="insertKey" @action="handleKeypadAction" />

					<div class="angle-selector">
						<span class="angle-label">Angle</span>
						<div class="angle-buttons">
							<button
								v-for="tab in angleTabs"
								:key="tab.value"
								type="button"
								class="angle-button"
								:class="{ 'is-active': angleMode === tab.value }"
								:aria-pressed="angleMode === tab.value"
								@click="calculator.setAngleMode(tab.value)"
							>
								{{ tab.label }}
							</button>
						</div>
					</div>

					<!-- Not `ink-gray-4`, which is #999999 and 2.68:1 on this card, and not `ink-gray-5`
               either, which measures 3.93:1 and also misses 4.5:1. This line tells a visitor which
               keys work, so it has to be readable. It sat below the fold, which is why the sweep
               never saw it until the scan started covering the whole page. -->
					<p id="calculator-keyboard-hint" class="calculator-hint">
						Enter calculates, Backspace deletes, and Escape clears while the expression
						field is focused.
					</p>
				</section>
			</section>
		</div>
	</main>
</template>

<script setup>
import { nextTick, onMounted, ref } from "vue";

import CalculatorKeypad from "./calculator/CalculatorKeypad.vue";
import { ANGLE_MODES } from "./calculator/index.js";
import { useCalculator } from "./calculator/useCalculator.js";

const angleTabs = [
	{ label: "DEG", value: ANGLE_MODES.DEGREES },
	{ label: "RAD", value: ANGLE_MODES.RADIANS },
];
const expressionField = ref(null);
const calculator = useCalculator();
const { expression, result, errorMessage, angleMode } = calculator;

// TextInput exposes its underlying <input> as `el`.
function expressionElement() {
	return expressionField.value ?? null;
}

async function insertKey(key) {
	const input = expressionElement();
	const value = typeof key === "string" ? key : key.value;

	const caret = calculator.insertText(value, input?.selectionStart, input?.selectionEnd, {
		startsNewExpression: typeof key === "object" && key.startsNewExpression,
	});

	await focusExpression(caret);
}

async function handleKeypadAction(action) {
	if (action === "calculate") {
		await runCalculation();
		return;
	}

	const input = expressionElement();

	const actions = {
		clear: () => calculator.clearExpression(),
		"clear-all": () => calculator.clearExpression(),
		"clear-entry": () =>
			calculator.clearCurrentInput(input?.selectionStart, input?.selectionEnd),
		backspace: () => calculator.backspace(input?.selectionStart, input?.selectionEnd),
		"toggle-sign": () => calculator.toggleSign(input?.selectionStart, input?.selectionEnd),
	};

	const caret = actions[action]?.();

	await focusExpression(typeof caret === "number" ? caret : undefined);
}

async function handleInputKeydown(event) {
	if (event.key === "Enter") {
		event.preventDefault();
		await runCalculation();
		return;
	}

	if (event.key === "Escape") {
		event.preventDefault();
		calculator.clearExpression();
		await focusExpression(0);
		return;
	}

	if (event.key === "Backspace") {
		event.preventDefault();
		const caret = calculator.backspace(event.target.selectionStart, event.target.selectionEnd);
		await focusExpression(caret);
	}
}

async function runCalculation() {
	const succeeded = calculator.calculate();
	await nextTick();
	if (succeeded) expressionElement()?.select();
	else expressionElement()?.focus();
}

async function focusExpression(caret = expression.value.length) {
	await nextTick();
	const input = expressionElement();
	input?.focus();
	input?.setSelectionRange(caret, caret);
}
</script>

<style>
html,
body,
#app {
	width: 100%;
	min-height: 100%;
	margin: 0;
}

.calculator-page {
	box-sizing: border-box;
	min-height: 100vh;
	padding: 10px;
	background: #fff;
	color: #202124;
	font-family: Arial, sans-serif;
}

.calculator-page * {
	box-sizing: border-box;
}

.calculator-container {
	width: min(100%, 330px);
	margin: 0 auto;
}

.calculator-heading {
	margin-bottom: 8px;
	text-align: center;
}

.calculator-heading h1 {
	margin: 0;
	font-size: 18px;
	font-weight: 600;
}

.calculator-card {
	padding: 11px;
	border: 3px solid #111;
	border-radius: 23px;
	background: #fff;
	box-shadow: 0 5px 18px rgb(0 0 0 / 13%);
}

.visually-hidden {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
}

.calculator-display {
	display: block;
	width: 100%;
	height: 58px;
	padding: 8px;
	border: 2px solid #111;
	border-radius: 12px;
	outline: none;
	background: #fff;
	color: #111;
	font: 26px/1.2 ui-monospace, monospace;
	text-align: right;
}

.calculator-display:focus-visible {
	box-shadow: 0 0 0 3px #999;
}

.calculator-result-area {
	min-height: 42px;
	padding: 4px 3px;
	text-align: right;
}

.calculator-result-label {
	margin: 0;
	color: #444;
	font-size: 10px;
}

.calculator-result {
	display: block;
	overflow: hidden;
	color: #202124;
	font: 600 18px/1.25 ui-monospace, monospace;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.calculator-error {
	margin: 8px 0 0;
	color: #b42318;
	font-size: 13px;
}

.angle-selector {
	display: flex;
	align-items: center;
	gap: 8px;
	padding-top: 8px;
}

.angle-label {
	color: #222;
	font-size: 11px;
}

.angle-buttons {
	display: flex;
	gap: 4px;
	padding: 4px;
	border-radius: 8px;
	background: #eee;
}

.angle-button {
	padding: 6px 10px;
	border: 0;
	border-radius: 6px;
	background: transparent;
	color: #222;
	cursor: pointer;
}

.angle-button.is-active {
	background: #111;
	color: #fff;
}

.calculator-hint {
	display: none;
}

@media (max-width: 360px) {
	.calculator-card {
		padding: 8px;
		border-width: 3px;
		border-radius: 18px;
	}
}
</style>
