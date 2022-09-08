import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faVideo } from '@fortawesome/free-solid-svg-icons'
import { Logo } from './components/Logo/Logo';
import { selectFiles } from './functions/selectFiles';
import { ImageFile } from './models/ImageFile';
import './App.scss';
import { sortNsfwResult } from './functions/sortBy';
import { NsfwSpy, NsfwSpyResult } from '@nsfwspy/browser'

const nsfwSpy = new NsfwSpy("./model/model.json");

export const App: React.FC = () => {
    const [image, setImage] = useState<ImageFile>();
    const [imageResults, setImageResults] = useState<NsfwSpyResult>();
    const [processing, setProcessing] = useState<boolean>(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const loadNsfwSpyModel = async () => {
            try {
                await nsfwSpy.load({
                    onProgress: (progress) => setStatus(`Model loading... ${(progress * 100).toFixed(2)}%`)
                });
                setTimeout(() => { 
                    setStatus("") 
                }, 1000);
            } catch {
                setStatus("Failed to load model");
            }
        };

        loadNsfwSpyModel();
    }, []);

    const selectFile = () => {
        selectFiles({ accept: 'image/*;', multiple: false }).then(async files => {
            if (files) {
                handleFile(files[0])
            }
        });
    }

    const handleFile = async (file: Blob) => {
        const imageFile: ImageFile = {
            file: file,
            url: URL.createObjectURL(file)
        };

        setImage(undefined);
        setImageResults(undefined);

        const fileType = imageFile.file.type;

        setProcessing(true);
        if (fileType.startsWith("image/")) {
            setImage(imageFile);
            const bitmap = await createImageBitmap(imageFile.file);
            const result = await nsfwSpy.classifyImage(bitmap)
            setImageResults(result);
        }
        setProcessing(false);
    }

    let sortedImageResults: [string, any][] | undefined = undefined;
    if (imageResults) {
        sortedImageResults = sortNsfwResult(imageResults);
    }

    return (
        <div className="app">
            <header>
                <Logo />
            </header>
            <main>
                <section className="image-section">
                    <div className="image-canvas" onClick={selectFile}>
                        {!image &&
                            <>
                                <div>
                                    Select an image.
                                </div>
                                <div className="icons">
                                    <div><FontAwesomeIcon icon={faImage} /></div>
                                </div>
                            </>}
                        {image &&
                            <img src={image.url} className="image-preview" />}
                    </div>
                </section>
                <section className="results-section">
                    {status &&
                        <div>
                            {status}
                        </div>}
                    {processing &&
                        <div>
                            Processing...
                        </div>}
                    {sortedImageResults &&
                        <div>
                            {sortedImageResults.map((result) =>
                                <div className={`result-value ${result[0]}`}>
                                    <span>{result[0]}</span>
                                    <span>{result[1].toFixed(10)}</span>
                                </div>
                            )}
                        </div>}
                </section>
            </main >
        </div >
    );
}

export default App;
