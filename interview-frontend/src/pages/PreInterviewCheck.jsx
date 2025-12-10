import SystemCheck from './SystemCheck';

const PreInterviewCheck = (props) => {
    // Re-use logic for now, or we can refactor.
    // Since the logic is all in SystemCheck and it is a "Page" actually (used as such), we can just re-export or wrap it.
    // The user asked to "Move logical components". 
    // For safety, I will import the component. 
    // Actually, SystemCheck was in /pages/SystemCheck.jsx based on my file view.
    return <SystemCheck {...props} />;
};
export default PreInterviewCheck;
