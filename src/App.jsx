import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Careers from './components/Careers';
import Hero from './components/Hero';
import RobotScene from './components/RobotScene';
import Capabilities from './components/Capabilities';
import Solutions from './components/Solutions';
import ProcessTimeline from './components/ProcessTimeline';
import Industries from './components/Industries';
import InquireSection from './components/InquireSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import ArchReviewModal from './components/ArchReviewModal';
import FloatingWidgets from './components/FloatingWidgets';

export default function App() {
  if (window.location.pathname.replace(/\/$/, '') === '/careers') return <Careers />;
  return <Home />;
}

function Home() {
  const [selectedScopes, setSelectedScopes] = useState([]);
  const [activeSolution, setActiveSolution] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [inquireVisible, setInquireVisible] = useState(false);
  const [archModalOpen, setArchModalOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? window.scrollY / docH : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const inquireEl = document.getElementById('inquire');
    if (!inquireEl || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInquireVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(inquireEl);
    return () => obs.disconnect();
  }, []);

  const toggleScope = (scopeId) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    );
  };

  return (
    <div id="top" className="site-background min-h-screen flex flex-col">
      <RobotScene activeSolution={activeSolution} onReady={setSceneReady} />
      <Navbar scrollProgress={scrollProgress} />

      <main className="flex-1">
        <Hero />
        <Capabilities
          selectedScopes={selectedScopes}
          onToggleScope={toggleScope}
        />
        <Solutions
          sceneReady={sceneReady}
          onActiveChange={setActiveSolution}
          onSelectSolutionScopes={(scopes) => setSelectedScopes(scopes)}
        />
        <ProcessTimeline onOpenArchModal={() => setArchModalOpen(true)} />
        <Industries />
        <InquireSection
          selectedScopes={selectedScopes}
          onToggleScope={toggleScope}
          onClearScopes={() => setSelectedScopes([])}
        />
        <FaqSection />
      </main>

      <Footer />

      <FloatingWidgets
        selectedCount={selectedScopes.length}
        inquireVisible={inquireVisible}
        scrollProgress={scrollProgress}
      />

      <ArchReviewModal
        open={archModalOpen}
        onClose={() => setArchModalOpen(false)}
        selectedScopes={selectedScopes}
      />

    </div>
  );
}
