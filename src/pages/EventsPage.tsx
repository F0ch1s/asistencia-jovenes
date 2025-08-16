import RegisterEventForm from "../components/RegisterEventForm";
import "../styles/Events.css";

const EventsPage = () => {
  return (
    <div className="events-container">
      <div className="events-card">
        <RegisterEventForm />
      </div>
    </div>
  );
};

export default EventsPage;
