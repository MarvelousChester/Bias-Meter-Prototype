import ReactDOM from "react-dom/client";
import BiasMeter from "../../components/BiasMeter";
import "~/assets/tailwind.css";

const waitForAnchor = (anchorSelector: string) =>
  new Promise<HTMLElement>((resolve) => {
    const existing = document.querySelector<HTMLElement>(anchorSelector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const found = document.querySelector<HTMLElement>(anchorSelector);
      if (found) {
        observer.disconnect();
        resolve(found);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const anchorID: string = "#secondary-inner";

    await waitForAnchor(anchorID);

    // Then create and mount the UI
    const ui = await createShadowRootUi(ctx, {
      name: "bias-mate",
      position: "inline",
      anchor: anchorID,
      append: "first",
      onMount: (container) => {
        // Don't mount react app directly on <body>
        const wrapper = document.createElement("div");
        container.append(wrapper);

        const root = ReactDOM.createRoot(wrapper);
        root.render(<BiasMeter bias="center" />);
        return { root, wrapper };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      },
    });

    ui.mount();
  },
});
