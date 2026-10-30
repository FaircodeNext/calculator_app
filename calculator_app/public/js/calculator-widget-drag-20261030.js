(function () {
	const launcherId = "calculator-widget-launcher";
	const panelId = "calculator-widget-panel";

	function readPosition(key) {
		try {
			const position = JSON.parse(window.localStorage.getItem(key) || "null");
			if (position && Number.isFinite(position.left) && Number.isFinite(position.top)) {
				return position;
			}
		} catch (error) {
			// Ignore unavailable or invalid local storage and use the default position.
		}
		return null;
	}

	function applyPosition(element, position) {
		if (!position) return;
		const bounds = element.getBoundingClientRect();
		const left = Math.max(0, Math.min(position.left, window.innerWidth - bounds.width));
		const top = Math.max(0, Math.min(position.top, window.innerHeight - bounds.height));
		element.style.left = `${left}px`;
		element.style.top = `${top}px`;
		element.style.right = "auto";
		element.style.bottom = "auto";
	}

	function makeDraggable(element, handle, storageKey, ignoreButtons) {
		applyPosition(element, readPosition(storageKey));

		let drag = null;
		function startDrag(event, inputType, pointerId) {
			if (
				!handle.contains(event.target) ||
				event.button !== 0 ||
				event.isPrimary === false ||
				drag ||
				(ignoreButtons && event.target.closest("button"))
			)
				return;

			const rect = element.getBoundingClientRect();
			drag = {
				inputType,
				pointerId,
				startX: event.clientX,
				startY: event.clientY,
				left: rect.left,
				top: rect.top,
				moved: false,
			};
		}

		window.addEventListener(
			"pointerdown",
			(event) => {
				startDrag(event, "pointer", event.pointerId);
			},
			true
		);
		// Mouse events also cover browsers or ERPNext extensions that interfere with Pointer Events.
		window.addEventListener("mousedown", (event) => startDrag(event, "mouse", null), true);

		function moveDrag(event, inputType, pointerId) {
			if (
				!drag ||
				drag.inputType !== inputType ||
				(inputType === "pointer" && pointerId !== drag.pointerId)
			)
				return;
			const deltaX = event.clientX - drag.startX;
			const deltaY = event.clientY - drag.startY;
			if (!drag.moved && Math.hypot(deltaX, deltaY) < 4) return;
			drag.moved = true;
			event.preventDefault();

			const rect = element.getBoundingClientRect();
			const left = Math.max(0, Math.min(drag.left + deltaX, window.innerWidth - rect.width));
			const top = Math.max(0, Math.min(drag.top + deltaY, window.innerHeight - rect.height));
			element.style.left = `${left}px`;
			element.style.top = `${top}px`;
			element.style.right = "auto";
			element.style.bottom = "auto";
		}

		window.addEventListener(
			"pointermove",
			(event) => moveDrag(event, "pointer", event.pointerId),
			true
		);
		window.addEventListener("mousemove", (event) => moveDrag(event, "mouse", null), true);

		function finishDrag(event) {
			if (!drag) return;
			if (event.type === "mouseup" && drag.inputType !== "mouse") return;
			if (
				(event.type === "pointerup" || event.type === "pointercancel") &&
				(drag.inputType !== "pointer" || event.pointerId !== drag.pointerId)
			)
				return;
			if (drag.moved) {
				const rect = element.getBoundingClientRect();
				element.dataset.suppressClick = "1";
				window.setTimeout(() => delete element.dataset.suppressClick, 500);
				try {
					window.localStorage.setItem(
						storageKey,
						JSON.stringify({ left: rect.left, top: rect.top })
					);
				} catch (error) {
					// Keep the current position for this page even when storage is unavailable.
				}
			}
			drag = null;
		}

		window.addEventListener("pointerup", finishDrag, true);
		window.addEventListener("pointercancel", finishDrag, true);
		window.addEventListener("mouseup", finishDrag, true);
		handle.addEventListener("dragstart", (event) => event.preventDefault());
	}

	function installCalculatorWidget() {
		if (!document.body || document.getElementById(launcherId)) return;

		const launcher = document.createElement("button");
		launcher.id = launcherId;
		launcher.className = "calculator-widget-launcher";
		launcher.type = "button";
		launcher.setAttribute("aria-label", "Open mini calculator");
		launcher.setAttribute("aria-expanded", "false");
		launcher.innerHTML =
			'<img src="/assets/calculator_app/calculator-black-white.svg" alt="" draggable="false">';

		const panel = document.createElement("section");
		panel.id = panelId;
		panel.className = "calculator-widget-panel";
		panel.setAttribute("role", "dialog");
		panel.setAttribute("aria-label", "Mini calculator");
		panel.hidden = true;
		panel.innerHTML = `
      <header class="calculator-widget-titlebar">
        <span>Calculator</span>
        <button type="button" class="calculator-widget-close" aria-label="Close calculator">×</button>
      </header>
      <iframe title="Mini calculator" loading="lazy" data-src="/assets/calculator_app/dist/index.html?mini=1&amp;v=20261030-1"></iframe>
    `;

		document.body.append(panel, launcher);
		makeDraggable(launcher, launcher, "calculator-widget-launcher-position", false);
		makeDraggable(
			panel,
			panel.querySelector(".calculator-widget-titlebar"),
			"calculator-widget-panel-position",
			true
		);

		const closeButton = panel.querySelector(".calculator-widget-close");
		const iframe = panel.querySelector("iframe");

		function togglePanel(open) {
			const shouldOpen = typeof open === "boolean" ? open : panel.hidden;
			panel.hidden = !shouldOpen;
			launcher.hidden = shouldOpen;
			if (!shouldOpen) {
				applyPosition(launcher, readPosition("calculator-widget-launcher-position"));
			}
			launcher.setAttribute("aria-expanded", String(shouldOpen));
			launcher.setAttribute(
				"aria-label",
				shouldOpen ? "Close mini calculator" : "Open mini calculator"
			);
			if (shouldOpen && iframe.dataset.loaded !== "true") {
				iframe.src = iframe.dataset.src;
				iframe.dataset.loaded = "true";
			}
		}

		launcher.addEventListener("click", () => {
			if (launcher.dataset.suppressClick) {
				delete launcher.dataset.suppressClick;
				return;
			}
			togglePanel();
		});
		closeButton.addEventListener("click", () => togglePanel(false));
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && !panel.hidden) togglePanel(false);
		});

		window.addEventListener("resize", () => {
			if (!launcher.hidden)
				applyPosition(launcher, readPosition("calculator-widget-launcher-position"));
			if (!panel.hidden)
				applyPosition(panel, readPosition("calculator-widget-panel-position"));
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", installCalculatorWidget, { once: true });
	} else {
		installCalculatorWidget();
	}
})();
