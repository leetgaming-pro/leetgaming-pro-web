import React, { useState } from 'react';
import HeatmapLayer from './HeatmapLayer'; // Custom component for heatmap visualization
import MapRegions from './MapRegions';     // Custom component for region selection
import TrajectoryLayer from './TrajectoryLayer'; // Custom component for trajectory display
import MapImage from './MapImage';         // Component to display the CS:GO map

function CSMapCardViewer() {
  const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap', 'regions', 'trajectories'
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedTrajectories, setSelectedTrajectories] = useState([]);

  return (
    <div className="csgo-map-container">
      <MapImage /> 
      {viewMode === 'heatmap' && <HeatmapLayer />}
      {viewMode === 'regions' && <MapRegions 
        selectedRegions={selectedRegions} 
        onRegionSelect={setSelectedRegions} />}
      {viewMode === 'trajectories' && <TrajectoryLayer 
        selectedTrajectories={selectedTrajectories}
        onTrajectorySelect={setSelectedTrajectories} />}
      <div className="controls">
        <button onClick={() => setViewMode('heatmap')}>Heatmap</button>
        <button onClick={() => setViewMode('regions')}>Regions</button>
        <button onClick={() => setViewMode('trajectories')}>Trajectories</button>
      </div>
    </div>
  );
}
