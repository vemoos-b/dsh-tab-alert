// dsh-tab-alert client: flashes the tab title "New Message!" when an agent turn
// finishes while the tab is hidden. Stops as soon as the user returns to the tab.
//
// Turn activity detection:
//   1) ctx.sessions.list.getSnapshot().byId[mainViewSessionId].running — the
//      primary path (same contract as @deepseek-ai/dsh-client-ui-conversation:
//      session.getSnapshot().running);
//   2) DOM fallback [data-chat-flow-kind="turn-process"] (dsh-auto-collapse
//      contract).
window.__ModuleLoader__.load({ id: "dsh-tab-alert", factory: function (require) {
	"use strict";

	var name = "dsh-tab-alert";
	var inject = ["sessions", "uiSession"];

	var ALERT_TEXT = "New Message!";
	var TICK_MS = 2000;
	var BLINK_MS = 1000;

	function apply(ctx) {
		var state = {
			blinkTimer: null,
			blinkOn: false,
			baseTitle: null,
			running: false
		};

		// ---------- active turn detector ----------
		function mainViewSessionId(byId) {
			if (!byId) return null;
			for (var id in byId) {
				var row = byId[id];
				if (row && ((row.retainedBy && (row.retainedBy.mainView || 0)) > 0)) return row.id || id;
			}
			return null;
		}

		function sessionRunningFromStore() {
			try {
				var sessions = ctx.sessions;
				var list = sessions && sessions.list;
				if (!list || typeof list.getSnapshot !== "function") return null;
				var snap = list.getSnapshot();
				if (!snap || !snap.byId) return null;
				var id = mainViewSessionId(snap.byId);
				if (!id) return null;
				var row = snap.byId[id];
				if (row && row.running === true) return true;
				if (row && row.running === false) return false;
				return null; // no running field on the record — fall through to DOM
			} catch (e) {
				return null;
			}
		}

		function domTurnPresent() {
			try {
				if (document.querySelector('[data-chat-flow-kind="turn-process"]')) return true;
			} catch (e) {}
			return false;
		}

		function isRunning() {
			var fromStore = sessionRunningFromStore();
			if (fromStore !== null) return fromStore;
			return domTurnPresent();
		}

		// ---------- blinking ----------
		function stopBlink() {
			if (state.blinkTimer !== null) {
				clearInterval(state.blinkTimer);
				state.blinkTimer = null;
			}
			if (state.baseTitle !== null) {
				try { document.title = state.baseTitle; } catch (e) {}
				state.baseTitle = null;
			}
			state.blinkOn = false;
		}

		function startBlink() {
			if (state.blinkTimer !== null) return;
			state.baseTitle = document.title;
			state.blinkOn = true;
			try { document.title = ALERT_TEXT; } catch (e) {}
			state.blinkTimer = setInterval(function () {
				state.blinkOn = !state.blinkOn;
				try { document.title = state.blinkOn ? ALERT_TEXT : state.baseTitle; } catch (e) {}
			}, BLINK_MS);
		}

		// ---------- loop ----------
		function onTick() {
			var visible;
			try { visible = document.visibilityState === "visible"; } catch (e) { visible = true; }
			var running = isRunning();
			if (state.running && !running && !visible) startBlink();
			state.running = running;
			if (visible) stopBlink();
		}

		function boot() {
			if (window.__dshTabAlertBooted) return;
			window.__dshTabAlertBooted = true;
			state.baseTitle = document.title;

			setInterval(onTick, TICK_MS);
			onTick();

			document.addEventListener("visibilitychange", function () {
				state.running = isRunning();
				if (document.visibilityState === "visible") stopBlink();
			});

			// The host DocumentTitle plugin rewrites the title on its own —
			// track the baseline title so blinking restores the right text.
			var titleEl = document.querySelector("title");
			if (titleEl) {
				new MutationObserver(function () {
					if (state.blinkTimer === null) state.baseTitle = document.title;
				}).observe(titleEl, { subtree: true, childList: true, characterData: true });
			}

			// Subscribe to sessions.list for immediate reaction instead of
			// waiting for the next poll tick.
			try {
				var list = ctx.sessions && ctx.sessions.list;
				if (list && typeof list.subscribe === "function") {
					var off = list.subscribe(function () { onTick(); });
					ctx.on("dispose", function () { try { off(); } catch (e) {} });
				}
			} catch (e) {}
		}

		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", boot);
		} else {
			boot();
		}

		ctx.on("dispose", function () {
			stopBlink();
			window.__dshTabAlertBooted = false;
		});
	}

	return { apply: apply, inject: inject, name: name };
}});