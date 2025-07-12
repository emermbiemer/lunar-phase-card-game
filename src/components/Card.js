class Card {
    constructor(phaseName, phaseImage) {
        this.phaseName = phaseName;
        this.phaseImage = phaseImage;
    }

    render() {
        const cardElement = document.createElement('div');
        cardElement.className = 'lunar-phase-card';
        
        const imageElement = document.createElement('img');
        imageElement.src = this.phaseImage;
        imageElement.alt = this.phaseName;

        const nameElement = document.createElement('h2');
        nameElement.textContent = this.phaseName;

        cardElement.appendChild(imageElement);
        cardElement.appendChild(nameElement);

        return cardElement;
    }

    displayDetails() {
        // This method can be expanded to show more details about the lunar phase
        console.log(`Phase: ${this.phaseName}`);
    }
}

export default Card;