// import rtk 
 const { data: comments, isLoading: commentsLoading } =
    useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });



// render

 <h3 style={{ marginTop: 24, color: PRIMARY_BLUE }}>
        Comment & Review History
      </h3>
      <CommentTrail comments={comments} isLoading={commentsLoading} />

    //   comment trail

    /* ===================== COMMENT TRAIL ===================== */
    const CommentTrail = ({ comments, isLoading }) => {
      if (isLoading) {
        return (
          <div style={{ textAlign: "center", padding: 20 }}>
            <Spin />
          </div>
        );
      }
      if (!comments || comments.length === 0) {
        return (
          <div style={{ paddingLeft: 15, borderLeft: `3px solid ${PRIMARY_BLUE}` }}>
            <i>No historical comments yet.</i>
          </div>
        );
      }
      return (
        <div
          style={{
            overflowX: "auto",
            whiteSpace: "nowrap",
            paddingBottom: 8,
          }}
        >
          <div style={{ display: "inline-flex", gap: 16 }}>
            {comments.map((item, index) => (
              <Card
                key={index}
                style={{
                  minWidth: 420,
                  maxWidth: 420,
                  borderLeft: `4px solid ${PRIMARY_BLUE}`,
                }}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <div
                      style={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <div>
                        <b>{item.userId?.name || "System"}</b>{" "}
                        {getRoleTag(item.userId?.role || "system")}
                      </div>
                      <span style={{ fontSize: 12, color: "#888" }}>
                        {new Date(
                          item.createdAt || item.timestamp
                        ).toLocaleString()}
                      </span>
                    </div>
                  }
                  description={
                    <div
                      style={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        marginTop: 8,
                      }}
                    >
                      {item.message}
                    </div>
                  }
                />
              </Card>
            ))}
          </div>
        </div>
      );
    };
