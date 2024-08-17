import modalCSS from '@/css/modal.module.css'
import RoundBtn from '@/components/ui/RoundBtn'

export default function Modal(props) {
    return (
        <div className={modalCSS.overlay} onClick={ 
            (e) => { if (e.target === e.currentTarget) props.toggle() } //close modal if overlay is clicked
        }>
            <div className={modalCSS.modal}>
                <div className={modalCSS.header}>
                    <h1>{props.title}</h1>
                    <div className={modalCSS.closeBTN}>
                        <RoundBtn icon="close" onClick={props.toggle}/>
                    </div>
                </div>

                <div className={modalCSS.body}>
                    <p>{props.children}</p>
                </div>

            </div>
        </div>
    )
}
