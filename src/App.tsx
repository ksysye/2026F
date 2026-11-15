import { ASSETS } from './config/assets';
import { ClawMachineScreen } from './components/ClawMachineScreen';
import { CapsuleOpeningScreen } from './components/CapsuleOpeningScreen';
import { CollectionScreen } from './components/CollectionScreen';
import { DevPanel } from './components/DevPanel';
import { IntroScreen } from './components/IntroScreen';
import { RewardScreen } from './components/RewardScreen';
import { Stage } from './components/Stage';
import { EndingScreen } from './components/ending/EndingScreen';
import { LetterScreen } from './components/ending/LetterScreen';
import { MessageArrivalPopup } from './components/ending/MessageArrivalPopup';
import { GameProvider, useGame } from './game/store';

function Game() {
  const { state, dispatch } = useGame();
  const p = state.phase;
  const showIntro = p === 'INTRO' || p === 'UNLOCKING';
  const showMachine = p !== 'INTRO' && p !== 'GAME_OVER';
  return (
    <Stage backdropImage={p === 'GAME_OVER' || showIntro ? null : ASSETS.machine.background}>
      <div className="game-root" data-phase={p}>
        {showMachine && <ClawMachineScreen />}
        {showIntro && <IntroScreen />}
        {p === 'CAPSULE_OPENING' && <CapsuleOpeningScreen />}
        {p === 'REWARD_REVEAL' && <RewardScreen />}
        {p === 'COLLECTION' && <CollectionScreen />}
        {p === 'MESSAGE_ARRIVAL' && <MessageArrivalPopup onOpen={() => dispatch({ type: 'ENDING_OPEN' })} />}
        {p === 'MESSAGE_OPEN' && <LetterScreen onFinish={() => dispatch({ type: 'ENDING_FINISH' })} />}
        {p === 'GAME_OVER' && <EndingScreen />}
      </div>
    </Stage>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Game />
      <DevPanel />
    </GameProvider>
  );
}
