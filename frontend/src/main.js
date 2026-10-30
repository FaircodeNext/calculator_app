import { createApp } from "vue";
import CalculatorView from "./CalculatorView.vue";

if (new URLSearchParams(window.location.search).has("mini")) {
	document.documentElement.classList.add("calculator-mini");
}

createApp(CalculatorView).mount("#app");
