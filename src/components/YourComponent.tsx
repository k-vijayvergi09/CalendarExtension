import { useToast } from '../context/ToastContext';

export const YourComponent = () => {
  const { showToast } = useToast();

  const handleSomeAction = () => {
    // Do something...
    showToast('Operation successful!', 'success');
  };

  return (
    <button 
      onClick={handleSomeAction}
      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg
                transition-colors duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
    >
      Show Toast
    </button>
  );
}; 