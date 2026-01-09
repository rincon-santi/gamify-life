import { Shell } from './components/layout/Shell';
import { EventModal } from './components/modal/EventModal';
import { AudioProvider } from '../application/AudioContext';

export function App() {
    return (
        <AudioProvider>
            <Shell />
            <EventModal />
        </AudioProvider>
    );
}
