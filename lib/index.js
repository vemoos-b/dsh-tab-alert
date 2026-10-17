// dsh-tab-alert host half: all logic lives in the client part (lib/client.js)
// where the DOM is available. The server half only registers the plugin.
const name = "dsh-tab-alert";
const inject = [];

function apply(ctx) {
	ctx.on("dispose", () => {});
}

export { apply, inject, name };
