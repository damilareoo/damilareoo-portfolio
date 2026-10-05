import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EasterEgg } from "./easter-egg";
import { SOLUTION_SAN } from "@/lib/chess";

const reduced = vi.hoisted(() => ({ value: false }));
vi.mock("@/lib/motion", async (orig) => ({
  ...(await orig<typeof import("@/lib/motion")>()),
  useReducedMotion: () => reduced.value,
}));

/** Type the trigger where a visitor would: at the document, not in a field. */
function typeTrigger(target: Window | HTMLElement = window, init: KeyboardEventInit = {}) {
  fireEvent.keyDown(target, { key: "e", ...init });
  fireEvent.keyDown(target, { key: "4", ...init });
}

const square = (name: RegExp) => screen.getByRole("button", { name });

describe("the trigger", () => {
  beforeEach(() => {
    reduced.value = false;
  });

  it("keeps the board out of the page until e4 is typed", () => {
    render(<EasterEgg />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("is hidden from assistive tech while it is closed", () => {
    const { container } = render(<EasterEgg />);
    expect(container.querySelector("[data-easter-egg]")).toHaveAttribute("aria-hidden", "true");
  });

  it("opens on e4", () => {
    render(<EasterEgg />);
    typeTrigger();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("stops being aria-hidden once it is open", () => {
    const { container } = render(<EasterEgg />);
    typeTrigger();
    expect(container.querySelector("[data-easter-egg]")).not.toHaveAttribute("aria-hidden");
  });

  it("takes focus when it opens", () => {
    render(<EasterEgg />);
    typeTrigger();
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  /* The failure mode that would make the whole site feel broken: someone
     filling in a form, typing an address or a name that happens to contain
     "e4", and a chessboard landing on top of it. */
  it("does NOT open when e4 is typed into a text input", () => {
    render(
      <>
        <input aria-label="Your email" />
        <EasterEgg />
      </>,
    );
    typeTrigger(screen.getByLabelText("Your email"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does NOT open when e4 is typed into a textarea", () => {
    render(
      <>
        <textarea aria-label="Message" />
        <EasterEgg />
      </>,
    );
    typeTrigger(screen.getByLabelText("Message"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does NOT open when e4 is typed into a contentEditable", () => {
    render(
      <>
        <div contentEditable data-testid="editor" suppressContentEditableWarning />
        <EasterEgg />
      </>,
    );

    /* jsdom parses the attribute but does not implement the property — its
       `isContentEditable` is hardcoded false, so the attribute alone cannot
       exercise this branch. Defined here rather than reaching for the
       attribute in the component: `isContentEditable` is the correct check
       because it is inherited, so a keystroke landing on a <b> nested inside
       an editable region is caught too, which an attribute lookup on the
       target would miss. */
    const editor = screen.getByTestId("editor");
    Object.defineProperty(editor, "isContentEditable", { value: true, configurable: true });

    typeTrigger(editor);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does NOT open on cmd+e then ctrl+4 — a shortcut is not typing", () => {
    render(<EasterEgg />);
    fireEvent.keyDown(window, { key: "e", metaKey: true });
    fireEvent.keyDown(window, { key: "4", ctrlKey: true });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not open on e, something else, then 4", () => {
    render(<EasterEgg />);
    fireEvent.keyDown(window, { key: "e" });
    fireEvent.keyDown(window, { key: "x" });
    fireEvent.keyDown(window, { key: "4" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("the board", () => {
  beforeEach(() => {
    reduced.value = false;
    render(<EasterEgg />);
    typeTrigger();
  });

  it("stands the three pieces where the position puts them", () => {
    expect(square(/^a6, white king$/)).toBeInTheDocument();
    expect(square(/^a1, white queen$/)).toBeInTheDocument();
    expect(square(/^a8, black king$/)).toBeInTheDocument();
  });

  it("labels all sixty-four squares in algebraic notation", () => {
    for (const f of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
      for (const r of [1, 2, 3, 4, 5, 6, 7, 8]) {
        expect(
          screen.getByRole("button", { name: new RegExp(`^${f}${r}(,|$)`) }),
          `${f}${r}`,
        ).toBeInTheDocument();
      }
    }
  });

  it("states the puzzle before anything is moved", () => {
    expect(screen.getByRole("dialog")).toHaveTextContent("Mate in one");
  });

  it("plays the solution and states mate", () => {
    fireEvent.click(square(/^a1, white queen$/));
    fireEvent.click(square(/^h8$/));

    expect(screen.getByText(new RegExp(SOLUTION_SAN))).toBeInTheDocument();
    expect(square(/^h8, white queen$/)).toBeInTheDocument();
    expect(square(/^a8, black king$/)).toHaveAttribute("data-mated");
  });

  it("refuses any other move and leaves the queen where it was", () => {
    fireEvent.click(square(/^a1, white queen$/));
    fireEvent.click(square(/^a4$/));

    expect(screen.queryByText(new RegExp(SOLUTION_SAN))).toBeNull();
    // The queen never left a1 — refusing is not moving and moving back.
    expect(square(/^a1, white queen$/)).toBeInTheDocument();
    expect(square(/^a4$/)).toHaveAttribute("data-refused");
  });

  /* Nothing but Qh8 mates in this position — lib/chess.test.ts proves it over
     every legal white move — so the board COULD say "not mate" here and be
     telling the truth. It still does not. The wording has to survive whatever
     position this file is ever pointed at, and the one that shipped here first
     admitted a second mate: a board saying "not mate" to a real mate would
     have been a false statement about chess. It also does not lecture. */
  it("never tells the player a move is not mate, only that it is not the move", () => {
    fireEvent.click(square(/^a1, white queen$/));
    fireEvent.click(square(/^d4$/));
    expect(screen.getByText(/Not the move/)).toBeInTheDocument();
    expect(screen.queryByText(/not mate/i)).toBeNull();
  });

  it("says so when the destination is not a queen's square at all", () => {
    fireEvent.click(square(/^a1, white queen$/));
    fireEvent.click(square(/^b4$/));
    expect(screen.getByText(/A queen cannot go there/)).toBeInTheDocument();
  });

  it("does not move a piece nobody picked up", () => {
    fireEvent.click(square(/^h8$/));
    expect(square(/^a1, white queen$/)).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(SOLUTION_SAN))).toBeNull();
  });

  it("moves a square cursor with the arrow keys", () => {
    const dialog = screen.getByRole("dialog");
    expect(square(/^a1, white queen$/)).toHaveAttribute("tabindex", "0");

    fireEvent.keyDown(dialog, { key: "ArrowUp" });
    expect(square(/^a2$/)).toHaveAttribute("tabindex", "0");
    expect(square(/^a1, white queen$/)).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(square(/^b2$/)).toHaveAttribute("tabindex", "0");
  });

  it("keeps the cursor on the board at its edges", () => {
    const dialog = screen.getByRole("dialog");
    // The cursor starts on a1, the bottom-left corner: walk it off two edges
    // and then off the two opposite ones.
    for (let i = 0; i < 10; i += 1) fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    for (let i = 0; i < 10; i += 1) fireEvent.keyDown(dialog, { key: "ArrowDown" });
    expect(square(/^a1, white queen$/)).toHaveAttribute("tabindex", "0");

    for (let i = 0; i < 10; i += 1) fireEvent.keyDown(dialog, { key: "ArrowRight" });
    for (let i = 0; i < 10; i += 1) fireEvent.keyDown(dialog, { key: "ArrowUp" });
    expect(square(/^h8$/)).toHaveAttribute("tabindex", "0");
  });

  it("closes on Escape", () => {
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes on a click outside the board", () => {
    const backdrop = screen.getByRole("dialog").parentElement as HTMLElement;
    fireEvent.click(backdrop);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not close on a click on the board itself", () => {
    fireEvent.click(screen.getByRole("dialog"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("comes back to the starting position after it is closed and reopened", () => {
    fireEvent.click(square(/^a1, white queen$/));
    fireEvent.click(square(/^h8$/));
    expect(screen.getByText(new RegExp(SOLUTION_SAN))).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    typeTrigger();

    expect(square(/^a1, white queen$/)).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(SOLUTION_SAN))).toBeNull();
  });
});

describe("when the visitor has asked for less motion", () => {
  beforeEach(() => {
    reduced.value = true;
  });
  afterEach(() => {
    reduced.value = false;
  });

  it("refuses with an instant state rather than a shake", () => {
    render(<EasterEgg />);
    typeTrigger();
    fireEvent.click(square(/^a1, white queen$/));
    fireEvent.click(square(/^a4$/));

    // The marked square and the line below the board are the whole rejection,
    // and they are there whether or not anything is allowed to move.
    expect(square(/^a4$/)).toHaveAttribute("data-refused");
    expect(screen.getByText(/Not the move/)).toBeInTheDocument();
  });

  it("still plays the solution", () => {
    render(<EasterEgg />);
    typeTrigger();
    fireEvent.click(square(/^a1, white queen$/));
    fireEvent.click(square(/^h8$/));
    expect(screen.getByText(new RegExp(SOLUTION_SAN))).toBeInTheDocument();
  });
});
