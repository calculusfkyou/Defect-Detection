import { useEffect } from 'react';
import useAbout from '../hooks/useAbout';

// 布局元件
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// 關於頁面元件
import TeamSection from '../components/about/TeamSection';
import MissionVision from '../components/about/MissionVision';
import TechStack from '../components/about/TechStack';
import ProjectTimeline from '../components/about/ProjectTimeline';
import ContactSection from '../components/about/ContactSection';

// UI 元件
import PageHeader from '../components/layout/PageHeader';
import Spinner from '../components/ui/Spinner';
import ErrorAlert from '../components/ui/ErrorAlert';

export default function AboutPage() {
  const {
    teamMembers,
    missionVision,
    techStack,
    projectTimeline,
    contactInfo,
    loading,
    error
  } = useAbout();

  // 頁面載入時滾動到頂部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />

      <PageHeader
        title="關於我們"
        description="了解我們的使命、願景、技術和團隊"
        // bgImage="/assets/Long-Logo.png"
      />

      <main>
        {loading ? (
          <div className="py-20 text-center">
            <div className="flex flex-col items-center">
              <Spinner size="lg" />
              <p className="mt-3 text-gray-600">載入關於我們的資訊...</p>
            </div>
          </div>
        ) : error ? (
          <div className="py-20">
            <ErrorAlert message={error} />
          </div>
        ) : (
          <>
            <MissionVision
              mission={missionVision.mission}
              vision={missionVision.vision}
              values={missionVision.values}
            />

            <TeamSection teamMembers={teamMembers.teamMembers} />

            <TechStack sections={techStack.sections} />

            <ProjectTimeline milestones={projectTimeline.milestones} />

            <ContactSection
              company={contactInfo.company}
              socialMedia={contactInfo.socialMedia}
              officeHours={contactInfo.officeHours}
              supportEmail={contactInfo.supportEmail}
            />
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
