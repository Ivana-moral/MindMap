import { render, screen, fireEvent } from '@testing-library/react';
import Flashcard from './Flashcard';

describe('Flashcard Component', () => {
  const word = 'Hola';
  const definition = 'Hello';

  test('renders the flashcard with the word', () => {
    render(<Flashcard word={word} definition={definition} />);

    const wordElement = screen.getByText(word);
    expect(wordElement).toBeInTheDocument();
  });

  test('flips the card and shows the definition on click', () => {
    render(<Flashcard word={word} definition={definition} />);

    // initially shows the word
    const wordElement = screen.getByText(word);
    expect(wordElement).toBeInTheDocument();

    // click the card
    fireEvent.click(wordElement);

    // after flip, it should show the definition instead
    const definitionElement = screen.getByText(definition);
    expect(definitionElement).toBeInTheDocument();
  });

  test('flips back to word on second click', () => {
    render(<Flashcard word={word} definition={definition} />);

    const card = screen.getByText(word);
    fireEvent.click(card); // flip to definition
    fireEvent.click(screen.getByText(definition)); // flip back

    expect(screen.getByText(word)).toBeInTheDocument();
  });
  
});
