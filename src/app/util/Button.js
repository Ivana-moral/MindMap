import styles from './Button.module.css';

/** 
 * Button component that can display text and trigger an onClick event.
 * @param {Object} props - The properties for the Button component.
 * @param {string} props.text - The text to display inside the button.
 * @param {function} onClick - The event to trigger when the button is clicked.
 * 
 * @example
 * // Button with no onClick handler.
 * <Button text="Click Me." />
 * 
 * @example
 * // Button with onClick handler.
 * <Button text="Click Me." onClick={() => alert("Button Clicked!")} />
*/
export default function Button({ text, onClick }) {
	return (
		<button className={styles.button} onClick={onClick}>
			{text}
		</button>
	)
}