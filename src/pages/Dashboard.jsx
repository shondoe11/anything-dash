import { Container, Card, Badge, Button } from 'react-bootstrap';
import TodoWidget from '../widgets/Todo/TodoWidget';
import WeatherWidget from '../widgets/Weather/WeatherWidget';
import CryptoWidget from '../widgets/Crypto/CryptoWidget';
import FootballWidget from '../widgets/Football/FootballWidget';
import AnimeWidget from '../widgets/Anime/AnimeWidget';
import { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAuth } from '../context/AuthContext';
import { fetchLayout, saveLayout } from '../services/service';
import { FaTachometerAlt, FaCog, FaCloudSunRain, FaTasks, FaCoins, FaFutbol, FaTv } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ResponsiveGrid = WidthProvider(Responsive);

export default function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const defaultLayout = [
    { i: 'weather',  x: 0,  y: 0,  w: 12, h: 11 },
    { i: 'todo',     x: 0,  y: 14, w: 12, h: 15 },
    { i: 'crypto',   x: 0,  y: 28, w: 12, h: 22 },
    { i: 'football', x: 0,  y: 42, w: 12, h: 18 },
    { i: 'anime',    x: 0,  y: 56, w: 12, h: 20 },
  ];

  const { userRecordId, isReady, login } = useAuth();
  const [layout, setLayout] = useState(defaultLayout);
  //& widget visibility state
  const widgetKeys = ['weather','todo','crypto','football','anime'];
  const iconMap = { weather: FaCloudSunRain, todo: FaTasks, crypto: FaCoins, football: FaFutbol, anime: FaTv };
  const [visibleWidgets, setVisibleWidgets] = useState(widgetKeys);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isReady && userRecordId) {
      fetchLayout(userRecordId).then(saved => {
        if (saved) {
          const parsed = JSON.parse(saved);
          const adjusted = parsed.map(item => {
            const def = defaultLayout.find(d => d.i === item.i);
            return def ? { ...item, h: def.h } : item;
          });
          setLayout(adjusted);
          setVisibleWidgets(adjusted.map(item => item.i));
        }
      });
    }
  }, [isReady, userRecordId]);

  const handleLayoutChange = newLayout => {
    setLayout(newLayout);
  };

  const refreshTodoList = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  //& manually save layout to Airtable
  const saveUserLayout = async () => {
    if (!userRecordId) {
      login();
      toast.error('You must be logged in to save layout.');
      return;
    }
    try {
      await saveLayout(userRecordId, JSON.stringify(layout));
      toast.success('Layout saved!');
    } catch (error) {
      console.error('save layout failed:', error);
      toast.error('Failed to save layout. Please try again.');
    }
  };

  //& reset to original default layout & widget state
  const resetLayout = async () => {
    setLayout(defaultLayout);
    setVisibleWidgets(widgetKeys);
    try {
      if (userRecordId) await saveLayout(userRecordId, JSON.stringify(defaultLayout));
      toast.success('Layout reset!');
    } catch (error) {
      console.error('reset layout failed:', error);
      toast.error('Failed to reset layout. Please try again.');
    }
  };

  //& toggle widget visibility
  const toggleWidget = key => {
    if (visibleWidgets.includes(key)) {
      //~ hide widget
      setVisibleWidgets(prev => prev.filter(k => k !== key));
      setLayout(prev => prev.filter(item => item.i !== key));
      toast.info(`Hiding ${key.charAt(0).toUpperCase() + key.slice(1)} widget`);
    } else {
      //~ show widget at top
      setVisibleWidgets(prev => [key, ...prev]);
      setLayout(prev => {
        const defaultItem = defaultLayout.find(item => item.i === key);
        //~ bump existing items
        const bumped = prev.map(item => ({ ...item, y: item.y + defaultItem.h }));
        return [{ ...defaultItem }, ...bumped];
      });
      toast.info(`Showing ${key.charAt(0).toUpperCase() + key.slice(1)} widget`);
    }
  };

  //& toggle widgets toolbar visibility
  const [showToolbar, setShowToolbar] = useState(false);
  const toggleToolbar = () => {
    setShowToolbar(prev => {
      const newVal = !prev;
      toast.info(newVal ? 'Showing widgets toolbar' : 'Hiding widgets toolbar');
      return newVal;
    });
  };

  return (
    <Container>
      <Card className="border-0 shadow-sm mb-4 widget-card overflow-hidden mt-4">
        <Card.Header className="d-flex justify-content-between align-items-center py-3 px-4 gradient-header">
          <div className="d-flex align-items-center">
            <FaTachometerAlt className="text-white me-2 widget-icon" size={24} />
            <h3 className="mb-0 text-white fw-bold">My Dashboard</h3>
            <FaCog className="text-white ms-3 widget-icon" size={24} style={{ cursor: 'pointer' }} onClick={toggleToolbar} title={showToolbar ? 'Hide widgets toolbar' : 'Show widgets toolbar'} />
          </div>
          <div className="d-flex align-items-center">
            <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill">
              {new Date().toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
            </Badge>
          </div>
        </Card.Header>
      </Card>
      {/* My Widgets toolbar */}
      {showToolbar && (
        <Card className="border-0 shadow-sm mb-4 widget-card overflow-hidden mt-4">
        <Card.Header className="d-flex justify-content-between align-items-center py-3 px-4 gradient-header widgets-toolbar rounded-top" title="Edit/Hide your available widgets here">
          <div className="d-flex align-items-center">
            <FaCog className="text-white me-2 widget-icon" size={24} />
            <h4 className="mb-0 text-white me-4">My Widgets</h4>
            {widgetKeys.map(key => {
              const Icon = iconMap[key];
              const visible = visibleWidgets.includes(key);
              return (
                <Icon key={key} className={`me-3 text-${visible?'white':'secondary'}`} size={18}
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleWidget(key)}
                  title={visible ? 'Hide' : 'Show'}
                />
              );
            })}
          </div>
          <div>
            <Button variant="outline-light" size="sm" className="ms-2 save-btn" onClick={saveUserLayout}>Save Layout</Button>
            <Button variant="outline-light" size="sm" className="ms-2 reset-btn" onClick={resetLayout}>Reset Layout</Button>
          </div>
        </Card.Header>
      </Card>
      )}
      <ResponsiveGrid
        className="layout"
        layouts={{ lg: layout, md: layout, sm: layout, xs: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
        rowHeight={30}
        onLayoutChange={handleLayoutChange}
        draggableCancel=".btn,button,a,input,textarea,select,.page-link,.pagination-dot,.carousel-custom-control,.nav-link,.widget-icon"
      >
        {layout.map(item => {
          switch (item.i) {
            case 'weather': return <div key="weather"><WeatherWidget /></div>;
            case 'todo':    return <div key="todo"><TodoWidget key={refreshTrigger} expandedView={false} showExpand={false} /></div>;
            case 'crypto':  return <div key="crypto"><CryptoWidget /></div>;
            case 'football':return <div key="football"><FootballWidget /></div>;
            case 'anime':   return <div key="anime"><AnimeWidget refreshTodoList={refreshTodoList} /></div>;
            default: return null;
          }
        })}
      </ResponsiveGrid>
    </Container>
  );
}