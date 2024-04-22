import React from 'react';

const Stepper = ({ steps }) => {
    return (
        <nav className="flex items-center place-items-center mb-12">
            <ol className="flex items-center mx-auto place-items-center pointer-events-none">
                {steps.map((step, index) => (
                    <li key={index} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-24' : ''}`}>
                        {index !== steps.length - 1 && (
                            <div className="absolute inset-0 flex items-center">
                                <div className={`h-0.5 w-full px-4 bg-${step.done ? 'primary' : 'background'}`}/>
                            </div>
                        )}
                        <span className={`relative flex h-8 w-16 items-center justify-center rounded-full bg-white`}>
                            <a href="#" className={`relative flex h-8 w-8 items-center justify-center rounded-full ${step.active ? 'border border-primary text-brimary border-2' : 'bg-background text-gray'} ${step.done ? 'text-white bg-primary' : 'text-gray'}`}>
                                <div className={`h-5 w-5 ${step.active ? 'text-primary' : 'text-gray'} ${step.done ? 'text-white' : 'text-gray'} text-center mb-1`}>{index + 1}</div>
                                <div className={`grid items-start w-36 h-12 mt-6 top-4 text-center max-w-min text-sm text-gray-light absolute text-base`}>{step.label}</div>
                            </a>
                        </span>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Stepper;
