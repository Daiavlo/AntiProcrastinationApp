import React from 'react';
import './PageLoader.css';

const PageLoader = ({ text = "Loading..." }) => {
    return (
        <div className="page-loader-container">
            <div className="spinner"></div>
            {text && <p className="loader-text">{text}</p>}
        </div>
    );
};

export default PageLoader;
