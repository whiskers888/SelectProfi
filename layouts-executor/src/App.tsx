import { Theme } from './settings/types';
import { SelectProfi } from './components/generated/SelectProfi';

let theme: Theme = 'light';

function App() {
  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme);

  return (
    <>
      <SelectProfi />
    </>
  ); // %EXPORT_STATEMENT%
}

export default App;
