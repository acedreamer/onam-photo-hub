import { DyadLogo } from "./dyad-logo";

export function MadeWithDyad() {
  return (
    <div className="">
      <a
        href="https://www.dyad.sh/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <span className="font-semibold">Made with</span>
        <DyadLogo className="w-16" />
      </a>
    </div>
  );
}