// "use client";

type Props = { pdf_url: string };

const PDFViewer = ({ pdf_url }: Props) => {
  // const [page, setPage] = useState(1);
  // const [pages, setPages] = useState(null);

  // const renderPagination = (page: number, pages: any) => {
  //   if (!pages) {
  //     return null;
  //   }
  //   let previousButton = (
  //     <li className="previous" onClick={() => setPage(page - 1)}>
  //       <a href="#">
  //         <i className="fa fa-arrow-left"></i> Previous
  //       </a>
  //     </li>
  //   );
  //   if (page === 1) {
  //     previousButton = (
  //       <li className="previous disabled">
  //         <a href="#">
  //           <i className="fa fa-arrow-left"></i> Previous
  //         </a>
  //       </li>
  //     );
  //   }
  //   let nextButton = (
  //     <li className="next" onClick={() => setPage(page + 1)}>
  //       <a href="#">
  //         Next <i className="fa fa-arrow-right"></i>
  //       </a>
  //     </li>
  //   );
  //   if (page === pages) {
  //     nextButton = (
  //       <li className="next disabled">
  //         <a href="#">
  //           Next <i className="fa fa-arrow-right"></i>
  //         </a>
  //       </li>
  //     );
  //   }
  //   return (
  //     <nav>
  //       <ul className="pager">
  //         {previousButton}
  //         {nextButton}
  //       </ul>
  //     </nav>
  //   );
  // };

  // const canvasEl = useRef(null);

  // const [loading, numPages] = usePdf({
  //   file: pdf_url,
  //   page,
  //   canvasEl,
  // });

  // useEffect(() => {
  //   setPages(numPages);
  // }, [numPages]);

  // return (
  //   <div>
  //     {loading && <span>Loading...</span>}
  //     <canvas ref={canvasEl} />
  //     {renderPagination(page, pages)}
  //   </div>
  // );

  return (
    <iframe
      src={`https://docs.google.com/gview?url=${pdf_url}&chrome=false&api=true&embedded=true`}
      className="w-full h-full"
    ></iframe>
    // <iframe
    //   src={`/tmp/fabio1697460382501.pdf`}
    //   className="w-full h-full"
    // ></iframe>

    // <object
    //   data={`${pdf_url}`}
    //   type="application/pdf"
    //   width="100%"
    //   height="100%"
    // />
  );
};

export default PDFViewer;
