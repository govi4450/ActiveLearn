import React from 'react';

function Loading({ message = 'Loading...' }) {
	return (
		<div className="loading">
			<i className="fas fa-spinner fa-spin"></i> {message}
		</div>
	);
}

export default Loading;
