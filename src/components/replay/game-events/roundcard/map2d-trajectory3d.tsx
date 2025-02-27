// // import React, { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';
// // import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// // import { ReplayAPI } from '../api'; 
// // import './Map.css';
// import React, { Suspense, useEffect, useState } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { OrbitControls, useTexture } from '@react-three/drei'; // Useful R3F helpers
// import { ReplayAPI } from '../api';


// interface MapProps {
//   matchId: string;
//   roundNumber: number;
//   selectedEvent: any; 
//   currentTick: number; 
// }

// interface MapData {
//   mapName: string;
//   roundNumber: number;
//   radarImageUrl: string;
//   playerTrajectories: PlayerTrajectory[];
//   areas: MapArea[];
// }

// interface PlayerTrajectory {
//   playerName: string;
//   positions: PlayerPosition[];
// }

// interface PlayerPosition {
//   tick: number;
//   x: number;
//   y: number;
//   z: number;
//   viewX: number;
//   viewY: number;
// }

// interface MapArea {
//   name: string;
//   type: 'polygon' | 'circle';
//   coordinates?: number[][]; // For polygons
//   center?: [number, number]; // For circles
//   radius?: number; // For circles
// }

// // Helper function to convert map coordinates to 3D scene coordinates
// function mapToSceneCoords(x: number, y: number): THREE.Vector3 {
//     // Adjust these scaling factors and offsets based on your map dimensions and 3D scene setup
//     const scaleFactor = 10; // Example scaling factor
//     const xOffset = -256;   // Example offset for centering
//     const yOffset = -256;   // Example offset for centering

//     return new THREE.Vector3(x * scaleFactor + xOffset, 0, y * scaleFactor + yOffset); // Assuming z-axis is up
// }

// // Function to create a line geometry from player positions
// function createTrajectoryLineGeometry(positions: PlayerPosition[]) {
//     const points = positions.map(pos => mapToSceneCoords(pos.x, pos.y));
//     return new THREE.BufferGeometry().setFromPoints(points);
// }

// // Function to update the trajectory line
// function updateTrajectoryLine(line: THREE.Line, positions: PlayerPosition[]) {
//     const geometry = line.geometry as THREE.BufferGeometry;
//     const newPositions = positions.map(pos => mapToSceneCoords(pos.x, pos.y));

//     // Update the existing geometry with new positions
//     geometry.setFromPoints(newPositions);
//     geometry.attributes.position.needsUpdate = true; 
// }



// /////////

// function createVisionConeMesh(playerPosition: PlayerPosition) {
//   const coneGeometry = new THREE.ConeGeometry(20, 50, 16); // Adjust radius, height, and segments
//   const coneMaterial = new THREE.MeshBasicMaterial({ 
//     color: 0x00ff00, // Example: Green color for vision cone
//     transparent: true,
//     opacity: 0.5, // Make it semi-transparent
//   });
//   const cone = new THREE.Mesh(coneGeometry, coneMaterial);

//   // Rotate the cone to match the player's view direction
//   const viewAngleRadians = (playerPosition.viewY + 90) * Math.PI / 180;
//   cone.rotation.y = viewAngleRadians;

//   // Position the cone at the player's location (adjust height as needed)
//   cone.position.set(
//     mapToSceneCoords(playerPosition.x, playerPosition.y).x, 
//     5, // Elevate the cone slightly above the ground
//     mapToSceneCoords(playerPosition.x, playerPosition.y).z
//   );

//   return cone;
// }

// function updateVisionCone(cone: THREE.Mesh, playerPosition: PlayerPosition) {
//   // Update cone position
//   cone.position.set(
//     mapToSceneCoords(playerPosition.x, playerPosition.y).x, 
//     5,
//     mapToSceneCoords(playerPosition.x, playerPosition.y).z
//   );

//   // Update cone rotation
//   const viewAngleRadians = (playerPosition.viewY + 90) * Math.PI / 180;
//   cone.rotation.y = viewAngleRadians;
// }




// function Map({ matchId, roundNumber, selectedEvent, currentTick }: MapProps) {
//     const [mapData, setMapData] = useState<MapData | null>(null);
  
//     useEffect(() => {
//       ReplayAPI.getMapData(matchId, roundNumber).then(setMapData);
//     }, [matchId, roundNumber]);
  
//     return (
//       <Canvas>
//         <Suspense fallback={null}> 
//           {mapData && (
//             <>
//               {/* Radar Image */}
//               <mesh rotation={[-Math.PI / 2, 0, 0]}>
//                 <planeGeometry args={[512, 512]} />
//                 <meshBasicMaterial map={useTexture(mapData.radarImageUrl)} />
//               </mesh>
  
//               <ambientLight intensity={0.8} />
  
//               {/* Player Trajectories and Vision Cones */}
//               {mapData.playerTrajectories.map(trajectory => (
//                 <Trajectory key={trajectory.playerName} trajectory={trajectory} currentTick={currentTick} />
//               ))}
  
//               {/* Areas (Bombsites, etc.) */}
//               {/* ... (render bombsite areas using mapData.areas) */}
  
//               {/* Orbit Controls */}
//               <OrbitControls enableDamping />
//             </>
//           )}
//         </Suspense>
//       </Canvas>
//     );
//   }

//   // Trajectory Component (Handles 3D line and vision cone for a single player)
// function Trajectory({ trajectory, currentTick }: { trajectory: PlayerTrajectory, currentTick: number }) {
//     const positions = trajectory.positions.filter(pos => pos.tick <= currentTick);
//     const lineRef = useRef<THREE.Line>(null!);
  
//     // Update trajectory line in each frame
//     useFrame(() => {
//       if (lineRef.current) {
//         updateTrajectoryLine(lineRef.current, positions);
//       }
//     });
  
//     return (
//       <group>
//         {/* Trajectory Line */}
//         <line ref={lineRef}>
//           <bufferGeometry attach="geometry" {...createTrajectoryLineGeometry(positions)} />
//           <lineBasicMaterial attach="material" color="white" />
//         </line>
        
//         {/* Vision Cone (Assuming you have a `VisionCone` component) */}
//         {positions.length > 0 && (
//           <VisionCone playerPosition={positions[positions.length - 1]} />
//         )}
//       </group>
//     );
//   }

// // ... (Helper functions to create and update geometries: createTrajectoryLineGeometry, updateTrajectoryLine, createVisionConeMesh, updateVisionCone)

// export default Map;
