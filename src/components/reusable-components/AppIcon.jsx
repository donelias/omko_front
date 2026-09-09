import { ReactSVG } from "react-svg";

const AppIcon = ({ src, ...props }) => (src ? <ReactSVG src={src} {...props} /> : null);

export default AppIcon;