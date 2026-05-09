import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./pageTransition.css";

export default function PageTransition({ children }) {
	const location = useLocation();
	const [displayChildren, setDisplayChildren] = useState(children);
	const [transitionStage, setTransitionStage] = useState('fade-in');
	const prevLocation = useRef(location);

	useEffect(() => {
		if (location.pathname !== prevLocation.current.pathname) {
			// Починаємо анімацію виходу
			setTransitionStage('fade-out');

			// Чекаємо закінчення анімації виходу
			const timeout = setTimeout(() => {
				setDisplayChildren(children);
				setTransitionStage('fade-in');
				prevLocation.current = location;
			}, 200);

			return () => clearTimeout(timeout);
		} else {
			setDisplayChildren(children);
			setTransitionStage('fade-in');
		}
	}, [location, children]);

	return (
		<div className={`page-transition-wrapper ${transitionStage}`}>
			{displayChildren}
		</div>
	);
}
