import React from "react";

type ImgProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
};

const Image = React.forwardRef<HTMLImageElement, ImgProps>(function Image(
  { fill, style, ...rest },
  ref
) {
  const mergedStyle = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }
    : style;
  return <img ref={ref} style={mergedStyle} {...rest} />;
});

export default Image;
