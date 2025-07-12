import aquaLogo from '@/assets/aqua-logo.jpg';
import agateLogo from '@/assets/agate-logo.jpg';
import topazLogo from '@/assets/topaz-logo.jpg';
import basicDbLogo from '@/assets/basic-db-logo.jpg';
import interDbLogo from '@/assets/inter-db-logo.png';
import proDbLogo from '@/assets/pro-db-logo.png';
import staffBadge from '@/assets/staff-badge.png';
import moderatorBadge from '@/assets/moderator-badge.png';
import developerBadge from '@/assets/developer-badge.png';

interface MembershipBadgesProps {
  // Membership badges
  isTopaz?: boolean;
  isAgate?: boolean;
  isAqua?: boolean;
  // Staff badges  
  isModerator?: boolean;
  isStaff?: boolean;
  isDeveloper?: boolean;
  // Database badges
  hasBasicDB?: boolean;
  hasInterDB?: boolean;
  hasProDB?: boolean;
  className?: string;
  transparentBackground?: boolean;
}

export function MembershipBadges({ 
  isTopaz, isAgate, isAqua, 
  isModerator, isStaff, isDeveloper,
  hasBasicDB, hasInterDB, hasProDB,
  className = "", 
  transparentBackground = false 
}: MembershipBadgesProps) {
  const badges = [];
  
  // Staff badges (red) - highest priority
  if (isModerator) {
    badges.push({
      id: 'moderator',
      element: (
        <img
          src={moderatorBadge}
          alt="Moderator"
          title="Moderator"
          className={`w-5 h-5 object-contain ${transparentBackground ? 'opacity-90' : ''}`}
        />
      )
    });
  }
  
  if (isStaff) {
    badges.push({
      id: 'staff',
      element: (
        <img
          src={staffBadge}
          alt="Staff"
          title="Staff"
          className={`w-5 h-5 object-contain ${transparentBackground ? 'opacity-90' : ''}`}
        />
      )
    });
  }
  
  if (isDeveloper) {
    badges.push({
      id: 'developer',
      element: (
        <img
          src={developerBadge}
          alt="Developer"
          title="Developer"
          className={`w-5 h-5 object-contain ${transparentBackground ? 'opacity-90' : ''}`}
        />
      )
    });
  }
  
  // Membership badges (colored)
  if (isTopaz) {
    badges.push({
      id: 'topaz',
      element: (
        <img
          src={topazLogo}
          alt="Topaz"
          title="Topaz Member"
          className={`w-5 h-5 object-contain ${transparentBackground ? 'opacity-90' : ''}`}
        />
      )
    });
  }
  
  if (isAgate) {
    badges.push({
      id: 'agate',
      element: (
        <img
          src={agateLogo}
          alt="Agate"
          title="Agate Member"
          className={`w-5 h-5 object-contain ${transparentBackground ? 'opacity-90' : ''}`}
        />
      )
    });
  }
  
  if (isAqua) {
    badges.push({
      id: 'aqua',
      element: (
        <img
          src={aquaLogo}
          alt="Aqua"
          title="Aqua Member"
          className={`w-5 h-5 object-contain ${transparentBackground ? 'opacity-90' : ''}`}
        />
      )
    });
  }
  
  // Database badges (blue) - requires specific plans
  if (hasBasicDB) {
    badges.push({
      id: 'basic-db',
      element: (
        <img
          src={basicDbLogo}
          alt="Basic DB"
          title="Basic Database"
          className={`w-5 h-5 object-contain ${transparentBackground ? 'opacity-90' : ''}`}
        />
      )
    });
  }
  
  if (hasInterDB) {
    badges.push({
      id: 'inter-db',
      element: (
        <img
          src={interDbLogo}
          alt="Inter+ DB"
          title="Inter+ Database"
          className={`w-5 h-5 object-contain ${transparentBackground ? 'opacity-90' : ''}`}
        />
      )
    });
  }
  
  if (hasProDB) {
    badges.push({
      id: 'pro-db',
      element: (
        <img
          src={proDbLogo}
          alt="Pro++ DB"
          title="Pro++ Database"
          className={`w-5 h-5 object-contain ${transparentBackground ? 'opacity-90' : ''}`}
        />
      )
    });
  }
  
  if (badges.length === 0) {
    return null;
  }
  
  return (
    <div className={`flex items-center space-x-1 ${transparentBackground ? 'bg-transparent' : ''} ${className}`}>
      {badges.map((badge) => (
        <div key={badge.id}>
          {badge.element}
        </div>
      ))}
    </div>
  );
}