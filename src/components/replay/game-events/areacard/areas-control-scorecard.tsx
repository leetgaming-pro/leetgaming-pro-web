import React from 'react';

/*
 *  AreaControlScorecard is a hybrid-view of all AreasScorecards
 */
interface AreaControl {
    areaName: string;
    controlStatus: string;
    description: string;
    mvpBreakdown: { // owners(ct)/mvp(t)
        playerStats: any; /* Breakdown of stats in scope of this area (and in match or in matches, KDA, KAST, ADR) */
        controlRating: number;
        controlStatus: string;


    }[],
}

interface AreasControlScorecardProps {
    areas: AreaControl[];
}

const AreasControlScorecard: React.FC<AreasControlScorecardProps> = ({ areas }) => {
    return (
        <div>
            {areas.map((area) => (
                <div key={area.areaName}>
                    <h3>{area.areaName}</h3>
                    <p>Control Status: {area.controlStatus}</p>
                    <p>Description: {area.description}</p>
                    <p>
                        {/*
                            Add popover/preview (or compact control) to display players Icons like []]]]]
                        */}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default AreasControlScorecard;