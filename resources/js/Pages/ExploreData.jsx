import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import AppLayout from '@/Layouts/AppLayout';
import Stepper from '@/Components/Stepper';
import { Head } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import SelectionDropdown from "@/Components/SelectionDropdown";


export default function ExploreData({
                                        canLogin,
                                        canRegister,
                                        laravelVersion,
                                        phpVersion,
                                    }) {
    const route = useRoute();
    const page = useTypedPage();
    const [people, setPeople] = useState([]);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        axios.get(route('get.insights'))
            .then(res => {
                setPeople(res.data);
            })
            .catch(err => { console.log(err); }, []);
    }, []);

    const steps = [
        { label: 'Select Geographies', active: activeStep === 0, done: activeStep > 0 },
        { label: 'Select Boundaries', active: activeStep === 1, done: activeStep > 1 },
        { label: 'Select Data', active: activeStep === 2, done: activeStep > 2 },
        { label: 'Preview', active: activeStep === 3, done: activeStep > 3 },
        { label: 'Complete', active: activeStep === 4, done: activeStep > 4 }
    ];

    const states = ['State 1', 'State 2', 'State 3']; // Example state options
    const counties = ['County 1', 'County 2', 'County 3']; // Example county options

    const [selectedState, setSelectedState] = useState('');
    const [selectedCounty, setSelectedCounty] = useState('');

    const handleStateSelect = (state) => {
        setSelectedState(state);
    };

    const handleCountySelect = (county) => {
        setSelectedCounty(county);
    };

    const handleButtonClick = () => {
        setActiveStep(activeStep + 1);
    };

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto my-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full mb-12">
                    <div className="items-center">
                        <div className="text-3xl font-bold text-secondary-dark text-center">
                            Download Your Data
                        </div>
                        <div className="text-gray-light my-12 mx-auto">
                            <Stepper steps={steps} />
                        </div>
                        {activeStep === 0 && (
                            <>
                                <div className="text-gray mt-24 mx-auto text-center">
                                    Select the state and/or county that you’re interested in. Your final dataset will be limited to data in this region.
                                </div>
                                <div className="grid grid-cols-12 my-12 gap-6">
                                    <div className="col-span-7 grid grid-cols-2 gap-6">
                                        <div>
                                            <div className="text-gray-light text-sm">State</div>
                                            <SelectionDropdown options={states} onSelect={handleStateSelect} />
                                        </div>
                                        <div>
                                            <div className="text-gray-light text-sm">County</div>
                                            <SelectionDropdown options={counties} onSelect={handleCountySelect} />
                                        </div>
                                    </div>
                                    <div className="col-span-5 w-full h-72 bg-background grid place-items-center">
                                        Map
                                    </div>
                                </div>
                            </>
                        )}
                        {activeStep === 1 && (
                            <>
                                <div className="text-gray mt-24 mx-auto text-center">
                                    Do another thing
                                </div>
                                <div className="grid grid-cols-12 my-12 gap-6">
                                    <div className="col-span-7 grid grid-cols-2 gap-6">
                                        <div>
                                            <div className="text-gray-light text-sm">Some dropdown</div>
                                            <SelectionDropdown options={states} onSelect={handleStateSelect} />
                                        </div>
                                    </div>
                                    <div className="col-span-5 w-full h-72 bg-background grid place-items-center">
                                        Map
                                    </div>
                                </div>
                            </>
                        )}
                        {activeStep === 2 && (
                            <>
                                <div className="text-gray mt-24 mx-auto text-center">
                                    And another thing
                                </div>
                                <div className="grid grid-cols-12 my-12 gap-6">
                                    <div className="col-span-7 grid grid-cols-2 gap-6">
                                    </div>
                                    <div className="col-span-5 w-full h-72 bg-background grid place-items-center">
                                        Map
                                    </div>
                                </div>
                            </>
                        )}
                        {activeStep === 3 && (
                            <>
                                <div className="text-gray mt-24 mx-auto text-center">
                                    And another
                                </div>
                                <div className="grid grid-cols-12 my-12 gap-6">
                                    <div className="col-span-7 grid grid-cols-2 gap-6">
                                    </div>
                                    <div className="col-span-5 w-full h-72 bg-background grid place-items-center">
                                        Map
                                    </div>
                                </div>
                            </>
                        )}
                        {activeStep === 4 && (
                            <>
                                <div className="text-gray mt-24 mx-auto text-center">
                                    And complete the steps
                                </div>
                                <div className="grid grid-cols-12 my-12 gap-6">
                                    <div className="col-span-7 grid grid-cols-2 gap-6">
                                    </div>
                                    <div className="col-span-5 w-full h-72 bg-background grid place-items-center">
                                        Map
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="col-span-5 flex justify-end">
                    <button className="bg-primary rounded-lg text-white py-2 px-4 border border-primary hover:bg-transparent hover:text-primary" onClick={handleButtonClick}>
                        {steps[activeStep + 1] ? steps[activeStep + 1].label : 'Complete'}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
