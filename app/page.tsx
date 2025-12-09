import { ChessBoard } from "@/components/chess/chess-board";
import { GameControls } from "@/components/chess/game-controls";

export default function Home() {
  return (
    <div className="game-container">
      <div className="game-layout">
        <ChessBoard />
        <GameControls />
      </div>
    </div>
  );
}
