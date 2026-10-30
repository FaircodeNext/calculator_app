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

html.calculator-mini,
html.calculator-mini body,
html.calculator-mini #app {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}

.calculator-page {
	box-sizing: border-box;
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 10px;
	background: var(--bg-color, #f8f8f8);
	color: var(--text-color, #36414c);
	font-family: var(
		--font-stack,
		Inter,
		-apple-system,
		BlinkMacSystemFont,
		"Segoe UI",
		sans-serif
	);
}

html.calculator-mini .calculator-page {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}

.calculator-page * {
	box-sizing: border-box;
}

.calculator-container {
	width: min(100%, 350px);
	margin: 0 auto;
}

.calculator-heading {
	margin-bottom: 10px;
	text-align: left;
}

.calculator-heading h1 {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
}

.calculator-card {
	padding: 12px;
	border: 1px solid var(--border-color, #d1d8dd);
	border-radius: 10px;
	background: var(--card-bg, #fff);
	box-shadow: var(--card-shadow, 0 1px 2px rgb(0 0 0 / 5%));
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
	border: 1px solid var(--border-color, #d1d8dd);
	border-radius: 6px;
	outline: none;
	background: var(--control-bg, #fff);
	color: var(--text-color, #36414c);
	font: 24px/1.2
		var(--font-stack, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
	text-align: right;
}

.calculator-display:focus-visible {
	border-color: var(--primary, #2490ef);
	box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary, #2490ef) 20%, transparent);
}

.calculator-result-area {
	min-height: 42px;
	padding: 4px 3px;
	text-align: right;
}

.calculator-result-label {
	margin: 0;
	color: var(--text-muted, #687178);
	font-size: 10px;
}

.calculator-result {
	display: block;
	overflow: hidden;
	color: var(--text-color, #36414c);
	font: 600 18px/1.25
		var(--font-stack, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
	text-overflow: ellipsis;
	white-space: nowrap;
}

.calculator-error {
	margin: 8px 0 0;
	color: var(--red-600, #d64545);
	font-size: 13px;
}

.angle-selector {
	display: flex;
	align-items: center;
	gap: 8px;
	padding-top: 8px;
}

.angle-label {
	color: var(--text-muted, #687178);
	font-size: 11px;
}

.angle-buttons {
	display: flex;
	gap: 4px;
	padding: 4px;
	border-radius: 6px;
	background: var(--control-bg, #f5f7fa);
}

.angle-button {
	padding: 6px 10px;
	border: 0;
	border-radius: 4px;
	background: transparent;
	color: var(--text-color, #36414c);
	cursor: pointer;
}

.angle-button.is-active {
	background: var(--primary, #2490ef);
	color: #fff;
}

.calculator-hint {
	display: none;
}

@media (max-height: 680px) {
	.calculator-page {
		padding: 6px;
	}

	.calculator-heading {
		margin-bottom: 6px;
	}

	.calculator-card {
		padding: 8px;
	}

	.calculator-display {
		height: 48px;
		font-size: 21px;
	}

	.calculator-result-area {
		min-height: 34px;
	}

	.calculator-key {
		height: clamp(28px, 5vh, 34px);
		border-radius: 6px;
		font-size: 15px;
	}

	.angle-selector {
		padding-top: 5px;
	}
}

@media (max-width: 360px) {
	.calculator-card {
		padding: 8px;
		border-radius: 8px;
	}
}
</style>
