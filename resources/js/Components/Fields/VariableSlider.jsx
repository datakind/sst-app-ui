import React from 'react';
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

const VariableSlider = ({ formatValue, variable, filterRanges, sliderValues, setSliderValues, availableVariables, hasOutliers }) => {
    const getUnit = (variable) => {
        const variableInfo = availableVariables.find(v => v.id === parseInt(variable));
        return variableInfo?.display || '';
    };

    return (
        <div className="mb-4 bg-gray-100 p-4 rounded-lg">
            <div className="mb-4 text-sm">{availableVariables.find(v => v.id === parseInt(variable))?.name || variable}</div>
            <div>
                <RangeSlider
                    min={Math.round(filterRanges[0])}
                    max={Math.round(filterRanges[1])}
                    step={(filterRanges[1] - filterRanges[0] < 2) ? 0.1 : 1}
                    onInput={(values) => setSliderValues(prev => ({ ...prev, [variable]: values }))}
                    value={sliderValues[variable]}
                />
                <div className="w-full flex justify-between text-sm mt-4">
                    <div>
                        {sliderValues[variable]?.[0] !== undefined
                            ? formatValue(sliderValues[variable][0], getUnit(variable))
                            : ''}
                    </div>
                    <div>
                        {sliderValues[variable]?.[1] !== undefined
                            ? formatValue(sliderValues[variable][1], getUnit(variable))
                            : ''}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VariableSlider;
