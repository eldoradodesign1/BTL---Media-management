import React from 'react';

export const LavaLampBackground: React.FC = () => {
  return (
    <div className="lava-lamp" aria-hidden="true">
      <div className="lava-lamp__aurora" />
      <div className="lava-lamp__orb lava-lamp__orb--rose" />
      <div className="lava-lamp__orb lava-lamp__orb--violet" />
      <div className="lava-lamp__orb lava-lamp__orb--blue" />
      <div className="lava-lamp__grain" />
    </div>
  );
};
